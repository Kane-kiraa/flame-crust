package com.flamecrust.api.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            try {
                // Auto repair schema history (removes half-failed entries)
                flyway.repair();
            } catch (Exception e) {
                // Ignore repair errors if table is empty
            }
            flyway.migrate();
        };
    }
}
