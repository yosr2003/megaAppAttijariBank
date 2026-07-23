package org.example.backendyosrmegaapp.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Client extends User {

    private String preferredLanguage;

    private String address;

    private String walletCurrency;

    private String paymentMethod;

    private String emergencyContact;
}