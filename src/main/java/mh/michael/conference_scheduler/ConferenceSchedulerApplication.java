package mh.michael.conference_scheduler;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class ConferenceSchedulerApplication {

	public static void main(String[] args) {
		SpringApplication.run(ConferenceSchedulerApplication.class, args);
	}

}
