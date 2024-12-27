// package com.nestflow.app.exception;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.MethodArgumentNotValidException;
// import org.springframework.web.bind.annotation.ControllerAdvice;
// import org.springframework.web.bind.annotation.ExceptionHandler;
// import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;


// @ControllerAdvice // Indique que cette classe gère globalement les exceptions
// public class GlobalExceptionHandler {

//     private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

//     @ExceptionHandler(UserServiceException.UserNotFoundException.class)
//     public ResponseEntity<String> handleUserNotFoundException(UserServiceException.UserNotFoundException ex) {
//         logger.warn("Utilisateur non trouvé : {}", ex.getMessage()); // Log au niveau WARNING
//         return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
//     }

//     @ExceptionHandler(UserServiceException.CurrentPasswordIncorrectException.class)
//     public ResponseEntity<String> handleCurrentPasswordIncorrectException(
//             UserServiceException.CurrentPasswordIncorrectException ex) {
//         logger.warn("Mot de passe actuel incorrect : {}", ex.getMessage());
//         return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
//     }

//     @ExceptionHandler(UserServiceException.UserAlreadyExistsException.class)
//     public ResponseEntity<String> handleUserAlreadyExistsException(UserServiceException.UserAlreadyExistsException ex) {
//         logger.warn("Tentative de création d'un utilisateur existant : {}", ex.getMessage());
//         return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
//     }

//     @ExceptionHandler(EntityNotFoundException.class)
//     public ResponseEntity<String> handleEntityNotFoundException(EntityNotFoundException ex) {
//         logger.warn("Entité non trouvée : {}", ex.getMessage());
//         return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ressource non trouvée."); // Message plus générique
//                                                                                            // pour le client
//     }

//     @ExceptionHandler(MethodArgumentNotValidException.class)
//     public ResponseEntity<String> handleValidationException(MethodArgumentNotValidException ex) {
//         logger.warn("Erreur de validation des arguments : {}", ex.getMessage());
//         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Données invalides."); // Message générique
//     }

//     @ExceptionHandler(MethodArgumentTypeMismatchException.class)
//     public ResponseEntity<String> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException ex) {
//         logger.warn("Erreur de type d'argument : {}", ex.getMessage());
//         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Type d'argument incorrect.");
//     }

//     @ExceptionHandler(Exception.class) // Gestion des exceptions non gérées spécifiquement
//     public ResponseEntity<String> handleGlobalException(Exception ex) {
//         logger.error("Erreur inattendue : ", ex); // Log au niveau ERROR avec la trace complète
//         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Une erreur inattendue est survenue.");
//     }
// }