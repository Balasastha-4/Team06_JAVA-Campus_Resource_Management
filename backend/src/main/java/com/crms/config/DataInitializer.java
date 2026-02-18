package com.crms.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.crms.model.Role;
import com.crms.model.User;
import com.crms.repository.UserRepository;
import com.crms.repository.BookRepository;
import com.crms.repository.ComplaintRepository;
import com.crms.repository.ResourceRepository;
import com.crms.repository.EventRequestRepository;
import com.crms.repository.StaffAvailabilityRepository;
import com.crms.model.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private EventRequestRepository eventRequestRepository;

    @Autowired
    private StaffAvailabilityRepository staffAvailabilityRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Migrate old department names to standardized names
        userRepository.findAll().forEach(u -> {
            boolean changed = false;
            if ("IT".equals(u.getDepartment())) {
                u.setDepartment("Information Technology");
                changed = true;
            } else if ("CSE".equals(u.getDepartment())) {
                u.setDepartment("Computer Science");
                changed = true;
            } else if ("ECE".equals(u.getDepartment())) {
                u.setDepartment("Electronic & Communication");
                changed = true;
            } else if ("MECH".equals(u.getDepartment())) {
                u.setDepartment("Mechanical Engineering");
                changed = true;
            } else if ("CIVIL".equals(u.getDepartment())) {
                u.setDepartment("Civil Engineering");
                changed = true;
            }
            if (changed) {
                userRepository.save(u);
                System.out.println("Migrated department for user: " + u.getEmail());
            }
        });

        // Check if admin exists
        if (!userRepository.existsByEmail("admin@crms.com")) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@crms.com");
            admin.setPhone("0000000000");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Default Admin User created: admin@crms.com / admin123");
        }

        // ... (existing books check)

        // 1. Seed some extra users for relationships
        if (!userRepository.existsByEmail("hod@crms.com")) {
            User hod = new User();
            hod.setName("Dept HOD");
            hod.setEmail("hod@crms.com");
            hod.setPassword(passwordEncoder.encode("hod123"));
            hod.setRole(Role.HOD);
            hod.setDepartment("Computer Science");
            hod.setStatus(UserStatus.ACTIVE);
            userRepository.save(hod);
            System.out.println("HOD User created.");
        }
        if (!userRepository.existsByEmail("student@crms.com")) {
            User studentUser = new User();
            studentUser.setName("Test Student");
            studentUser.setEmail("student@crms.com");
            studentUser.setPassword(passwordEncoder.encode("student123"));
            studentUser.setRole(Role.STUDENT);
            studentUser.setDepartment("Computer Science");
            studentUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(studentUser);
            System.out.println("Student User created.");
        }
        if (!userRepository.existsByEmail("staff@crms.com")) {
            User staffUser = new User();
            staffUser.setName("Test Staff");
            staffUser.setEmail("staff@crms.com");
            staffUser.setPassword(passwordEncoder.encode("staff123"));
            staffUser.setRole(Role.STAFF);
            staffUser.setDepartment("Computer Science");
            staffUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(staffUser);
            
            // Availability for default staff
            StaffAvailability sa = new StaffAvailability();
            sa.setUser(staffUser);
            sa.setAvailable(true);
            staffAvailabilityRepository.save(sa);
            System.out.println("Staff User created.");
        }

        // New IT HOD
        if (!userRepository.existsByEmail("hod_it@crms.com")) {
            User hodIt = new User();
            hodIt.setName("IT HOD");
            hodIt.setEmail("hod_it@crms.com");
            hodIt.setPassword(passwordEncoder.encode("hod123"));
            hodIt.setRole(Role.HOD);
            hodIt.setDepartment("Information Technology");
            hodIt.setStatus(UserStatus.ACTIVE);
            userRepository.save(hodIt);
            System.out.println("IT HOD User created: hod_it@crms.com / hod123");
        }

        // --- NEW IT STAFF MEMBERS ---
        String[][] itStaff = {
            {"Dr. Arulmani", "arulmani@crms.com"},
            {"Mrs. Priya", "priya@crms.com"},
            {"Mr. Rajesh", "rajesh@crms.com"},
            {"Dr. Suresh", "suresh@crms.com"}
        };

        for (String[] faculty : itStaff) {
            if (!userRepository.existsByEmail(faculty[1])) {
                User f = new User();
                f.setName(faculty[0]);
                f.setEmail(faculty[1]);
                f.setPassword(passwordEncoder.encode("staff123"));
                f.setRole(Role.STAFF);
                f.setDepartment("Information Technology");
                f.setStatus(UserStatus.ACTIVE);
                userRepository.save(f);

                StaffAvailability sa = new StaffAvailability();
                sa.setUser(f);
                sa.setAvailable(true);
                staffAvailabilityRepository.save(sa);
                System.out.println("IT Faculty created: " + faculty[0]);
            }
        }

        User student = userRepository.findByEmail("student@crms.com").orElse(null);

        // 2. Seed Resources if empty
        if (resourceRepository.count() == 0) {
            String[][] resData = {
                {"Main Auditorium", "AUDITORIUM", "500"},
                {"CS Lab 1", "LAB", "50"},
                {"CS Lab 2", "LAB", "50"},
                {"Main Ground", "GROUND", "1000"},
                {"Seminar Hall A", "SEMINAR_HALL", "100"},
                {"Conference Room", "SEMINAR_HALL", "30"},
                {"Classroom 101", "CLASSROOM", "60"},
                {"Event Hall B", "EVENT_HALL", "200"}
            };

            for (String[] data : resData) {
                Resource r = new Resource();
                r.setName(data[0]);
                r.setType(ResourceType.valueOf(data[1]));
                r.setCapacity(Integer.parseInt(data[2]));
                r.setStatus(ResourceStatus.AVAILABLE);
                resourceRepository.save(r);
            }
            System.out.println("Sample resources seeded.");
        }
        List<Resource> resources = resourceRepository.findAll();

        // 3. Seed 10 Complaints if empty
        if (complaintRepository.count() == 0 && student != null) {
            String[][] compData = {
                {"CLEANLINESS", "Canteen area is not clean", "Canteen", "ADMIN"},
                {"ELECTRICITY", "Fan not working in Class 101", "Room 101", "ADMIN"},
                {"WATER", "Water cooler leaking in CS block", "CS Block 2nd Floor", "ADMIN"},
                {"FURNITURE", "Broken chair in Lab 1", "CS Lab 1", "HOD"},
                {"SAFETY", "Main gate lock issue", "Main Gate", "ADMIN"},
                {"NOISE", "Loud construction noise near library", "Library Area", "ADMIN"},
                {"OTHER", "Wifi connectivity issue in hostel", "Hostel Block A", "ADMIN"},
                {"ELECTRICITY", "Lights flickering in seminar hall", "Seminar Hall A", "ADMIN"},
                {"CLEANLINESS", "Restroom needs cleaning", "Ground Floor CS Block", "ADMIN"},
                {"WATER", "No water in washroom", "Main Building 1st Floor", "ADMIN"}
            };

            for (String[] data : compData) {
                Complaint c = new Complaint();
                c.setUserId(student.getId());
                c.setCategory(ComplaintCategory.valueOf(data[0]));
                c.setDescription(data[1]);
                c.setLocation(data[2]);
                c.setRoutedTo(data[3]);
                c.setDepartment("Computer Science");
                c.setStatus(ComplaintStatus.OPEN);
                complaintRepository.save(c);
            }
            System.out.println("10 sample complaints seeded.");
        }

        // 4. Seed 10 Event Requests if empty
        if (eventRequestRepository.count() == 0 && student != null && !resources.isEmpty()) {
            Object[][] evtData = {
                {"Tech Symposium 2026", EventType.WORKSHOP, resources.get(0).getId(), 10, 200, "Annual tech meet"},
                {"AI Webinar", EventType.SEMINAR, resources.get(4).getId(), 5, 80, "Webinar on Generative AI"},
                {"Cultural Fest Prep", EventType.CULTURAL, resources.get(3).getId(), 15, 150, "Dance and music practice"},
                {"Inter-College Cricket", EventType.SPORTS, resources.get(3).getId(), 20, 300, "Cricket tournament finals"},
                {"Java Workshop", EventType.WORKSHOP, resources.get(1).getId(), 7, 40, "Hands-on Java 17 session"},
                {"Robotics Seminar", EventType.SEMINAR, resources.get(4).getId(), 12, 100, "Seminar on Industrial Robotics"},
                {"Coding Contest", EventType.OTHER, resources.get(2).getId(), 3, 60, "Blind coding challenge"},
                {"Guest Lecture", EventType.SEMINAR, resources.get(4).getId(), 8, 120, "Lecture by industry expert"},
                {"Photography Workshop", EventType.WORKSHOP, resources.get(5).getId(), 14, 25, "Basic workshop"},
                {"Alumni Meet", EventType.CULTURAL, resources.get(0).getId(), 30, 400, "Annual gathering"}
            };

            for (Object[] data : evtData) {
                EventRequest er = new EventRequest();
                er.setUserId(student.getId());
                er.setEventName((String)data[0]);
                er.setEventType((EventType)data[1]);
                er.setResourceId((String)data[2]);
                er.setEventDate(LocalDate.now().plusDays((Integer)data[3]));
                er.setTimeSlot(LocalTime.of(10, 0));
                er.setParticipants((Integer)data[4]);
                er.setDescription((String)data[5]);
                er.setDepartment("Computer Science");
                er.setStatus(EventStatus.PENDING);
                eventRequestRepository.save(er);
            }
            System.out.println("10 sample event requests seeded.");
        }
    }
}
