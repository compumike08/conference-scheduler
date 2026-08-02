package mh.michael.conference_scheduler.config;

import mh.michael.conference_scheduler.security.JwtTokenAuthorizationOncePerRequestFilter;
import mh.michael.conference_scheduler.security.JwtUnAuthorizedResponseAuthenticationEntryPoint;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class JWTWebSecurityConfig extends WebSecurityConfigurerAdapter {
  private final JwtUnAuthorizedResponseAuthenticationEntryPoint jwtUnAuthorizedResponseAuthenticationEntryPoint;
  private final UserDetailsService databaseAuthUserDetailsService;
  private final JwtTokenAuthorizationOncePerRequestFilter jwtAuthenticationTokenFilter;

  public JWTWebSecurityConfig(
    JwtUnAuthorizedResponseAuthenticationEntryPoint jwtUnAuthorizedResponseAuthenticationEntryPoint,
    UserDetailsService databaseAuthUserDetailsService,
    JwtTokenAuthorizationOncePerRequestFilter jwtAuthenticationTokenFilter
  ) {
    this.jwtUnAuthorizedResponseAuthenticationEntryPoint = jwtUnAuthorizedResponseAuthenticationEntryPoint;
    this.databaseAuthUserDetailsService = databaseAuthUserDetailsService;
    this.jwtAuthenticationTokenFilter = jwtAuthenticationTokenFilter;
  }

  @Autowired
  public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
    auth
      .userDetailsService(databaseAuthUserDetailsService);
  }

  @Bean
  @Override
  public AuthenticationManager authenticationManagerBean() throws Exception {
    return super.authenticationManagerBean();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Override
  protected void configure(HttpSecurity httpSecurity) throws Exception {
    httpSecurity
      .httpBasic().disable()
      .cors().and().csrf().disable()
      .exceptionHandling().authenticationEntryPoint(jwtUnAuthorizedResponseAuthenticationEntryPoint).and()
      .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
      .authorizeRequests()
      .antMatchers("/error").anonymous()
      .anyRequest().authenticated();

    httpSecurity
      .addFilterBefore(jwtAuthenticationTokenFilter, UsernamePasswordAuthenticationFilter.class);

    httpSecurity
      .headers()
      .frameOptions().sameOrigin()  //H2 Console Needs this setting
      .cacheControl(); //disable caching
  }

  @Override
  public void configure(WebSecurity webSecurity) throws Exception {
    webSecurity
      .ignoring()
      .antMatchers(
        HttpMethod.POST,
        "/authenticate"
      )
      .antMatchers(
        HttpMethod.POST,
        "/registerUser"
      )
      .antMatchers(
        HttpMethod.POST,
        "/sendForgotPasswordEmail"
      )
      .antMatchers(
        HttpMethod.POST,
        "/resetPassword"
      )
      .antMatchers(HttpMethod.OPTIONS, "/**")
      .and()
      .ignoring()
      .antMatchers(
        HttpMethod.GET,
        "/favicon.ico"
      )
      .and()
      .ignoring()
      .antMatchers(
        HttpMethod.GET,
        "/"
      )
      .and()
      .ignoring()
      .antMatchers("/static/**")
      .and()
      .ignoring()
      .antMatchers("/h2-console/**/**");//Should not be in Production!
  }
}
