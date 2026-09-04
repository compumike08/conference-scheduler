package mh.michael.conference_scheduler;

import org.jspecify.annotations.NullMarked;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

public class ServletInitializer extends SpringBootServletInitializer {

	@Override
  @NullMarked
	protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
		return application.sources(ConferenceSchedulerApplication.class);
	}

}
