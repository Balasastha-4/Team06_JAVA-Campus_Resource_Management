package com.crms.dto.response;

import java.util.List;
import lombok.Data;

@Data
public class JwtResponse {
  private String token;
  private String type = "Bearer";
  private String id;
  private String name;
  private String email;
  private String department;
  private List<String> roles;

  public JwtResponse(String accessToken, String id, String name, String email, String department, List<String> roles) {
    this.token = accessToken;
    this.id = id;
    this.name = name;
    this.email = email;
    this.department = department;
    this.roles = roles;
  }
}
