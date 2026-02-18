package com.crms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "libraryTransactions")
public class LibraryTransaction {
    @Id
    private String id;

    @DBRef
    private User user;

    @DBRef
    private Book book; // If null, this is a "Book Demand" request

    private String demandedBookTitle; // For "WANTED" list

    private TransactionType type; // BORROW_REQUEST, RETURN, DEMAND
    private TransactionStatus status; // PENDING, APPROVED, REJECTED, RETURNED

    private int priority; // 1=HOD, 2=STAFF, 3=STUDENT
    private boolean isDemand;

    private LocalDateTime requestDate;
    private LocalDateTime issueDate;
    private LocalDateTime returnDate;
    private LocalDateTime actualReturnDate;

    public LibraryTransaction() {
    }

    // Constructor for Borrow Request
    public LibraryTransaction(User user, Book book, int priority) {
        this.user = user;
        this.book = book;
        this.priority = priority;
        this.type = TransactionType.BORROW_REQUEST;
        this.status = TransactionStatus.PENDING;
        this.requestDate = LocalDateTime.now();
        this.isDemand = false;
    }

    // Constructor for Book Demand
    public LibraryTransaction(User user, String demandedBookTitle, int priority) {
        this.user = user;
        this.demandedBookTitle = demandedBookTitle;
        this.priority = priority;
        this.type = TransactionType.DEMAND;
        this.status = TransactionStatus.PENDING;
        this.requestDate = LocalDateTime.now();
        this.isDemand = true;
    }

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public String getDemandedBookTitle() {
        return demandedBookTitle;
    }

    public void setDemandedBookTitle(String demandedBookTitle) {
        this.demandedBookTitle = demandedBookTitle;
    }

    public TransactionType getType() {
        return type;
    }

    public void setType(TransactionType type) {
        this.type = type;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public boolean isDemand() {
        return isDemand;
    }

    public void setDemand(boolean demand) {
        isDemand = demand;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }

    public LocalDateTime getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDateTime issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDateTime getReturnDate() {
        return returnDate;
    }

    public void setReturnDate(LocalDateTime returnDate) {
        this.returnDate = returnDate;
    }

    public LocalDateTime getActualReturnDate() {
        return actualReturnDate;
    }

    public void setActualReturnDate(LocalDateTime actualReturnDate) {
        this.actualReturnDate = actualReturnDate;
    }
}
