package com.blushaura.api;

import java.awt.Color;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;

final class ImageResizer {
  private ImageResizer() {}

  static BufferedImage crop(BufferedImage source, int x, int y, int width, int height) {
    if (x < 0
        || y < 0
        || width < 1
        || height < 1
        || (long) x + width > source.getWidth()
        || (long) y + height > source.getHeight()) {
      throw new IllegalArgumentException("Crop outside image bounds");
    }
    return source.getSubimage(x, y, width, height);
  }

  static BufferedImage fitOnWhite(BufferedImage source, int width, int height, int scale) {
    var output = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
    var graphics = output.createGraphics();
    try {
      graphics.setColor(Color.WHITE);
      graphics.fillRect(0, 0, width, height);
      graphics.setRenderingHint(
          RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
      graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
      double ratio =
          Math.min((double) width / source.getWidth(), (double) height / source.getHeight())
              * scale
              / 100.0;
      int imageWidth = Math.max(1, (int) Math.round(source.getWidth() * ratio));
      int imageHeight = Math.max(1, (int) Math.round(source.getHeight() * ratio));
      graphics.drawImage(
          source,
          (width - imageWidth) / 2,
          (height - imageHeight) / 2,
          imageWidth,
          imageHeight,
          null);
      return output;
    } finally {
      graphics.dispose();
    }
  }
}
