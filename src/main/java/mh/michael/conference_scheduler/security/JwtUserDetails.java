package mh.michael.conference_scheduler.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import mh.michael.conference_scheduler.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class JwtUserDetails implements UserDetails {
  @Serial
  private static final long serialVersionUID = -8535605411284956079L;

  private final Long id;
  private final UUID userUuid;
  private final String username;
  private final String email;
  private final String password;
  private final Collection<? extends GrantedAuthority> authorities;

  public JwtUserDetails(Long id, UUID userUuid, String username, String email, String password,
                        Collection<? extends GrantedAuthority> authorities) {
    this.id = id;
    this.userUuid = userUuid;
    this.username = username;
    this.email = email;
    this.password = password;
    this.authorities = authorities;
  }

  public static JwtUserDetails build(User user) {
    List<GrantedAuthority> authorities = user.getRoles().stream()
      .map(role -> new SimpleGrantedAuthority(role.getName().name()))
      .collect(Collectors.toList());

    return new JwtUserDetails(
      user.getId(),
      user.getUserUuid(),
      user.getUsername(),
      user.getEmail(),
      user.getPassword(),
      authorities);
  }

  @JsonIgnore
  public Long getId() {
    return id;
  }

  public UUID getUserUuid() { return userUuid; }

  @Override
  public String getUsername() {
    return username;
  }

  public String getEmail() { return email; }

  @JsonIgnore
  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @JsonIgnore
  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @JsonIgnore
  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @JsonIgnore
  @Override
  public String getPassword() {
    return password;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return authorities;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }
}
