package com.blushaura.api;

import static org.junit.jupiter.api.Assertions.*;

import java.awt.Color;
import java.awt.image.BufferedImage;
import org.junit.jupiter.api.Test;

class ImageResizerTest {
  private BufferedImage redImage(int width, int height) {
    var image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
    var g = image.createGraphics();
    g.setColor(Color.RED);
    g.fillRect(0, 0, width, height);
    g.dispose();
    return image;
  }

  @Test
  void landscapeFitsInsideSquareWithoutCroppingAndWithWhitePadding() {
    var result = ImageResizer.fitOnWhite(redImage(400, 200), 800, 800, 100);
    assertEquals(800, result.getWidth());
    assertEquals(800, result.getHeight());
    assertEquals(Color.WHITE.getRGB(), result.getRGB(400, 100));
    assertEquals(Color.RED.getRGB(), result.getRGB(0, 400));
    assertEquals(Color.RED.getRGB(), result.getRGB(799, 400));
    assertEquals(Color.WHITE.getRGB(), result.getRGB(400, 700));
  }

  @Test
  void portraitFitsLandscapeAndScaleAddsWhiteSpaceOnEverySide() {
    var result = ImageResizer.fitOnWhite(redImage(200, 400), 800, 400, 50);
    assertEquals(Color.RED.getRGB(), result.getRGB(400, 200));
    assertEquals(Color.WHITE.getRGB(), result.getRGB(340, 200));
    assertEquals(Color.WHITE.getRGB(), result.getRGB(460, 200));
    assertEquals(Color.WHITE.getRGB(), result.getRGB(400, 90));
    assertEquals(Color.WHITE.getRGB(), result.getRGB(400, 310));
  }

  @Test
  void cropSelectsOnlyTheChosenAreaBeforeResizing() {
    var source = redImage(400, 200);
    var g = source.createGraphics();
    g.setColor(Color.BLUE);
    g.fillRect(200, 0, 200, 200);
    g.dispose();
    var cropped = ImageResizer.crop(source, 200, 0, 200, 200);
    var output = ImageResizer.fitOnWhite(cropped, 600, 600, 100);
    assertEquals(Color.BLUE.getRGB(), output.getRGB(0, 0));
    assertEquals(Color.BLUE.getRGB(), output.getRGB(300, 300));
    assertEquals(Color.BLUE.getRGB(), output.getRGB(599, 599));
  }

  @Test
  void cropRejectsOutOfBoundsAndEmptySelections() {
    var source = redImage(400, 200);
    assertThrows(IllegalArgumentException.class, () -> ImageResizer.crop(source, -1, 0, 100, 100));
    assertThrows(IllegalArgumentException.class, () -> ImageResizer.crop(source, 0, 0, 0, 100));
    assertThrows(IllegalArgumentException.class, () -> ImageResizer.crop(source, 350, 0, 100, 100));
    assertThrows(
        IllegalArgumentException.class,
        () -> ImageResizer.crop(source, Integer.MAX_VALUE, 0, 100, 100));
  }

  @Test
  void transparentAreasAreFlattenedToWhite() {
    var transparent = new BufferedImage(200, 200, BufferedImage.TYPE_INT_ARGB);
    transparent.setRGB(100, 100, Color.RED.getRGB());
    var result = ImageResizer.fitOnWhite(transparent, 200, 200, 100);
    assertFalse(result.getColorModel().hasAlpha());
    assertEquals(Color.WHITE.getRGB(), result.getRGB(0, 0));
    assertEquals(Color.RED.getRGB(), result.getRGB(100, 100));
  }
}
