package com.blushaura.api;

import java.io.*;
import java.util.*;
import javax.imageio.ImageIO;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class MediaController {
  private final JdbcClient jdbc;

  public MediaController(JdbcClient jdbc) {
    this.jdbc = jdbc;
  }

  @PostMapping("/api/admin/media")
  @ResponseStatus(HttpStatus.CREATED)
  public Map<String, String> upload(
      @RequestParam("file") MultipartFile file,
      @RequestParam(defaultValue = "1200") int width,
      @RequestParam(defaultValue = "1200") int height,
      @RequestParam(defaultValue = "100") int scale,
      @RequestParam(required = false) Integer cropX,
      @RequestParam(required = false) Integer cropY,
      @RequestParam(required = false) Integer cropWidth,
      @RequestParam(required = false) Integer cropHeight)
      throws IOException {
    if ("video/mp4".equals(file.getContentType()) || "video/webm".equals(file.getContentType())) {
      if (file.isEmpty() || file.getSize() > 20 * 1024 * 1024)
        throw bad("Choose an MP4 or WebM video up to 20 MB");
      byte[] video = file.getBytes();
      boolean mp4 =
          video.length >= 12
              && video[4] == 'f'
              && video[5] == 't'
              && video[6] == 'y'
              && video[7] == 'p';
      boolean webm =
          video.length >= 4
              && (video[0] & 255) == 0x1a
              && (video[1] & 255) == 0x45
              && (video[2] & 255) == 0xdf
              && (video[3] & 255) == 0xa3
              && new String(
                      video,
                      0,
                      Math.min(video.length, 256),
                      java.nio.charset.StandardCharsets.ISO_8859_1)
                  .contains("webm");
      if (!(file.getContentType().equals("video/mp4") ? mp4 : webm))
        throw bad("The video container is invalid. Choose a valid MP4 or WebM");
      UUID id = UUID.randomUUID();
      jdbc.sql("INSERT INTO media(id,content_type,data) VALUES (:id,:type,:data)")
          .param("id", id)
          .param("type", file.getContentType())
          .param("data", video)
          .update();
      return Map.of("url", "/api/media/" + id);
    }
    if (file.isEmpty() || file.getSize() > 5 * 1024 * 1024)
      throw bad("Choose a JPEG or PNG up to 5 MB");
    if (width < 200 || width > 2400 || height < 200 || height > 2400 || scale < 25 || scale > 100)
      throw bad("Canvas dimensions must be 200–2400 pixels and image size must be 25–100 percent");
    byte[] input = file.getBytes();
    try (var stream = ImageIO.createImageInputStream(new ByteArrayInputStream(input))) {
      var readers = ImageIO.getImageReaders(stream);
      if (!readers.hasNext()) throw bad("The file is not a valid JPEG or PNG");
      var reader = readers.next();
      try {
        String format = reader.getFormatName().toLowerCase(Locale.ROOT);
        if (!Set.of("jpeg", "jpg", "png").contains(format))
          throw bad("Only JPEG and PNG are supported");
        reader.setInput(stream);
        int sourceWidth = reader.getWidth(0), sourceHeight = reader.getHeight(0);
        if (sourceWidth > 6000
            || sourceHeight > 6000
            || (long) sourceWidth * sourceHeight > 16000000)
          throw bad("Image is too large. Use at most 16 megapixels and 6000 pixels per side");
        var source = reader.read(0);
        if (cropX != null || cropY != null || cropWidth != null || cropHeight != null) {
          if (cropX == null || cropY == null || cropWidth == null || cropHeight == null)
            throw bad("Choose a complete crop area");
          try {
            source = ImageResizer.crop(source, cropX, cropY, cropWidth, cropHeight);
          } catch (IllegalArgumentException ex) {
            throw bad("The crop area must be inside the image");
          }
        }
        var image = ImageResizer.fitOnWhite(source, width, height, scale);
        var out = new ByteArrayOutputStream();
        String outputFormat = format.equals("png") ? "png" : "jpeg";
        if (!ImageIO.write(image, outputFormat, out)) throw bad("Image could not be processed");
        byte[] data = out.toByteArray();
        if (data.length > 5 * 1024 * 1024) throw bad("Processed image exceeds 5 MB");
        UUID id = UUID.randomUUID();
        jdbc.sql("INSERT INTO media(id,content_type,data) VALUES (:id,:type,:data)")
            .param("id", id)
            .param("type", "image/" + outputFormat)
            .param("data", data)
            .update();
        return Map.of("url", "/api/media/" + id);
      } finally {
        reader.dispose();
      }
    } catch (javax.imageio.IIOException ex) {
      throw bad("The image is damaged or unsupported");
    }
  }

  @GetMapping("/api/media/{id}")
  public ResponseEntity<Resource> image(@PathVariable UUID id) {
    return jdbc.sql("SELECT content_type,data FROM media WHERE id=:id")
        .param("id", id)
        .query(
            (rs, n) ->
                ResponseEntity.ok()
                    .cacheControl(CacheControl.maxAge(java.time.Duration.ofDays(7)))
                    .contentType(MediaType.parseMediaType(rs.getString(1)))
                    .header("X-Content-Type-Options", "nosniff")
                    .body((Resource) new ByteArrayResource(rs.getBytes(2))))
        .optional()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found"));
  }

  private ResponseStatusException bad(String text) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, text);
  }
}
