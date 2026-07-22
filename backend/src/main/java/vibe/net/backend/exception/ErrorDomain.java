package vibe.net.backend.exception;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Getter
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum ErrorDomain {
    AUTHENTICATION(0, 99),
    COMMENT(100, 199),
    FRIENDSHIP(200, 299),
    POST(300, 399),
    PROFILE(400, 499),
    REACTION(500, 599),
    USER(600, 699),
    SYSTEM(1000, 2000)
    ;

    int base;
    int max;
}
