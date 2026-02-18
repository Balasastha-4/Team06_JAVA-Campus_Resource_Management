package com.crms.service;

import com.crms.model.*;
import com.crms.repository.BookRepository;
import com.crms.repository.LibraryTransactionRepository;
import com.crms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LibraryService {

    @Autowired
    private LibraryTransactionRepository transactionRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public List<Book> searchBooks(String keyword) {
        if (keyword == null || keyword.isEmpty())
            return getAllBooks();
        return bookRepository.searchBooks(keyword);
    }

    public Book addBook(Book book) {
        book.setAvailableCopies(book.getTotalCopies());
        return bookRepository.save(book);
    }

    public Book updateBook(String id, Book bookDetails) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        // Calculate difference in total copies to adjust available copies
        int diff = bookDetails.getTotalCopies() - book.getTotalCopies();

        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setCategory(bookDetails.getCategory());
        book.setIsbn(bookDetails.getIsbn());
        book.setSection(bookDetails.getSection());
        book.setTotalCopies(bookDetails.getTotalCopies());

        // Adjust available copies
        book.setAvailableCopies(book.getAvailableCopies() + diff);
        // Ensure available doesn't go negative (though strictly it shouldn't if logic
        // is correct)
        if (book.getAvailableCopies() < 0)
            book.setAvailableCopies(0);

        return bookRepository.save(book);
    }

    // New Priority Logic: HOD=1, STAFF=2, STUDENT=3
    private int calculatePriority(Role role) {
        if (role == Role.HOD)
            return 1;
        if (role == Role.STAFF)
            return 2;
        return 3;
    }

    @Transactional
    public LibraryTransaction requestBook(String userId, String bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("Book is currently unavailable");
        }

        // Check active borrows limit
        long activeCount = transactionRepository.findByUserId(userId).stream()
                .filter(t -> t.getType() == TransactionType.BORROW_REQUEST &&
                        (t.getStatus() == TransactionStatus.PENDING || t.getStatus() == TransactionStatus.APPROVED
                                || t.getStatus() == TransactionStatus.ISSUED))
                .count();

        if (activeCount >= 3) {
            throw new RuntimeException("Max borrow limit (3) reached");
        }

        int priority = calculatePriority(user.getRole());
        LibraryTransaction transaction = new LibraryTransaction(user, book, priority);
        return transactionRepository.save(transaction);
    }

    public LibraryTransaction demandBook(String userId, String bookTitle) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        int priority = calculatePriority(user.getRole());
        LibraryTransaction transaction = new LibraryTransaction(user, bookTitle, priority);
        return transactionRepository.save(transaction);
    }

    public List<LibraryTransaction> getPendingBorrowRequests() {
        return transactionRepository.findByStatusAndTypeOrderByPriorityAscRequestDateAsc(
                TransactionStatus.PENDING, TransactionType.BORROW_REQUEST);
    }

    public List<LibraryTransaction> getIssuedBooks() {
        return transactionRepository.findByStatusAndTypeOrderByPriorityAscRequestDateAsc(
                TransactionStatus.ISSUED, TransactionType.BORROW_REQUEST);
    }

    public List<LibraryTransaction> getAllDemands() {
        return transactionRepository.findByStatusAndTypeOrderByPriorityAscRequestDateAsc(
                TransactionStatus.PENDING, TransactionType.DEMAND);
    }

    public List<LibraryTransaction> getMyTransactions(String userId) {
        return transactionRepository.findByUserId(userId);
    }

    @Transactional
    public synchronized LibraryTransaction updateTransactionStatus(String transactionId, TransactionStatus status) {
        LibraryTransaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (transaction.getType() == TransactionType.BORROW_REQUEST) {
            Book book = transaction.getBook();
            // Re-fetch book to get latest stock
            book = bookRepository.findById(book.getId()).orElse(book);

            if (status == TransactionStatus.APPROVED && transaction.getStatus() == TransactionStatus.PENDING) {
                if (book.getAvailableCopies() > 0) {
                    book.setAvailableCopies(book.getAvailableCopies() - 1);
                    bookRepository.save(book);
                    transaction.setIssueDate(LocalDateTime.now());
                } else {
                    throw new RuntimeException("No copies available to approve");
                }
            } else if (status == TransactionStatus.RETURNED) {
                book.setAvailableCopies(book.getAvailableCopies() + 1);
                bookRepository.save(book);
                transaction.setActualReturnDate(LocalDateTime.now());
            }
        }

        transaction.setStatus(status);
        return transactionRepository.save(transaction);
    }
}
