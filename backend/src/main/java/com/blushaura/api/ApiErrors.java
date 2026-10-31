package com.blushaura.api;

import org.springframework.http.*;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiErrors {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ProblemDetail> validation(MethodArgumentNotValidException ex) {
    var problem =
        ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST, "Please check your delivery details and bag items.");
    problem.setProperty(
        "errors",
        ex.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .toList());
    return ResponseEntity.badRequest().body(problem);
  }

  @ExceptionHandler(ResponseStatusException.class)
  ResponseEntity<ProblemDetail> status(ResponseStatusException ex) {
    return ResponseEntity.status(ex.getStatusCode())
        .body(ProblemDetail.forStatusAndDetail(ex.getStatusCode(), ex.getReason()));
  }

  @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
  ResponseEntity<ProblemDetail> conflict() {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(
            ProblemDetail.forStatusAndDetail(
                HttpStatus.CONFLICT,
                "This name already exists, or a product still uses the category/subcategory. Reassign those products before removing it."));
  }

  @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
  ResponseEntity<ProblemDetail> uploadSize() {
    return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
        .body(
            ProblemDetail.forStatusAndDetail(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "Choose an image up to 5 MB or a video up to 20 MB."));
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  ResponseEntity<ProblemDetail> unreadable() {
    return ResponseEntity.badRequest()
        .body(ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Invalid request body."));
  }
}
