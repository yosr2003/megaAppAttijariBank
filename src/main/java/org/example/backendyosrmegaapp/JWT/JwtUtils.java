package org.example.backendyosrmegaapp.JWT;


import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import org.example.backendyosrmegaapp.entities.UserDetailsImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;


import javax.crypto.SecretKey;
import java.util.Date;


@Component
public class JwtUtils {


    private static final Logger logger =
            LoggerFactory.getLogger(JwtUtils.class);



    @Value("${app.jwtSecret}")
    private String jwtSecret;



    @Value("${app.jwtExpirationMs}")
    private int jwtExpirationMs;



    private SecretKey getSigningKey(){

        return Keys.hmacShaKeyFor(
                jwtSecret.getBytes()
        );

    }




    public String generateJwtToken(Authentication authentication){


        UserDetailsImpl userPrincipal =
                (UserDetailsImpl) authentication.getPrincipal();



        return Jwts.builder()

                .setSubject(userPrincipal.getUsername())

                .setIssuedAt(new Date())

                .setExpiration(
                        new Date(
                                System.currentTimeMillis() + jwtExpirationMs
                        )
                )

                .signWith(
                        getSigningKey()
                )

                .compact();

    }





    public String getEmailFromJwtToken(String token) {

        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();

    }




    public boolean validateJwtToken(String authToken) {

        try {

            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);

            return true;

        } catch (MalformedJwtException e) {

            logger.error("Invalid JWT token: {}", e.getMessage());

        } catch (ExpiredJwtException e) {

            logger.error("JWT token expired: {}", e.getMessage());

        } catch (UnsupportedJwtException e) {

            logger.error("JWT token unsupported: {}", e.getMessage());

        } catch (IllegalArgumentException e) {

            logger.error("JWT claims empty: {}", e.getMessage());

        }

        return false;
    }

}