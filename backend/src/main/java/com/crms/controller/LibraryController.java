package com.crms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.crms.model.Book;
import com.crms.model.BookDemand;
import com.crms.model.BorrowRequest;
import com.crms.model.LibraryTransaction;
import com.crms.model.TransactionStatus;
import com.crms.security.services.UserDetailsImpl;
import com.crms.service.LibraryService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class LibraryController {
    @Autowired
    private LibraryService libraryService;

    @GetMapping("/books")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'STAFF', 'STUDENT', 'HOD')")
    public List<Book> searchBooks(@RequestParam(required = false) String keyword) {
        return libraryService.searchBooks(keyword);
    }

    @PostMapping("/books")
    @PreAuthorize("hasAuthority('ADMIN')")
    public Book addBook(@Valid @RequestBody Book book) {
        return libraryService.addBook(book);
    }

    @org.springframework.web.bind.annotation.PutMapping("/books/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> updateBook(@PathVariable String id, @RequestBody Book book) {
        try {
            return ResponseEntity.ok(libraryService.updateBook(id, book));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/borrow-request")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'STAFF', 'HOD')")
    public ResponseEntity<?> requestBook(@RequestBody BorrowRequest request) {
        // Using BorrowRequest as DTO for bookId
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            return ResponseEntity.ok(libraryService.requestBook(userDetails.getId(), request.getBookId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Returning List<LibraryTransaction> instead of BorrowRequest
    @GetMapping("/borrow-request/my")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'STAFF', 'HOD')")
    public List<LibraryTransaction> getMyTransactions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return libraryService.getMyTransactions(userDetails.getId());
    }

    @PostMapping("/book-demand")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'STAFF', 'HOD')")
    public ResponseEntity<?> createDemand(@RequestBody BookDemand demand) {
        // Using BookDemand as DTO for bookTitle/Description
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            return ResponseEntity.ok(libraryService.demandBook(userDetails.getId(), demand.getBookTitle()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Admin Endpoints for Managing Transactions based on Priority
    @GetMapping("/borrow-request/pending")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<LibraryTransaction> getPendingBorrowRequests() {
        return libraryService.getPendingBorrowRequests();
    }

    @GetMapping("/borrow-request/issued")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<LibraryTransaction> getIssuedBooks() {
        return libraryService.getIssuedBooks();
    }

    @GetMapping("/book-demand/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<LibraryTransaction> getAllDemands() {
        return libraryService.getAllDemands();
    }

    @PatchMapping("/borrow-request/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> approveBorrow(@PathVariable String id) {
        try {
            return ResponseEntity.ok(libraryService.updateTransactionStatus(id, TransactionStatus.APPROVED));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/borrow-request/{id}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> rejectBorrow(@PathVariable String id) {
        try {
            return ResponseEntity.ok(libraryService.updateTransactionStatus(id, TransactionStatus.REJECTED));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/borrow-request/{id}/return")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> returnBook(@PathVariable String id) {
        try {
            return ResponseEntity.ok(libraryService.updateTransactionStatus(id, TransactionStatus.RETURNED));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/book-demand/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> approveDemand(@PathVariable String id) {
        try {
            return ResponseEntity.ok(libraryService.updateTransactionStatus(id, TransactionStatus.APPROVED));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/book-demand/{id}/reject")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> rejectDemand(@PathVariable String id) {
        try {
            return ResponseEntity.ok(libraryService.updateTransactionStatus(id, TransactionStatus.REJECTED));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
