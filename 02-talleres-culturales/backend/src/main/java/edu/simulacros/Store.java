package edu.simulacros;

import jakarta.persistence.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

@Entity
@Table(name = "catalog_records")
class CatalogRecord {
    @Id Long id;
    String owner;
    @Lob @Column(nullable = false) String payload;

    protected CatalogRecord() {}

    CatalogRecord(long id, String owner, String payload) {
        this.id = id;
        this.owner = owner;
        this.payload = payload;
    }
}

interface Catalog extends JpaRepository<CatalogRecord, Long>, JpaSpecificationExecutor<CatalogRecord> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from CatalogRecord r where r.id = :id")
    Optional<CatalogRecord> lock(long id);
}

@Entity
@Table(name = "accounts")
class Account {
    @Id String email;
    String name;
    String passwordHash;

    protected Account() {}

    Account(String email, String name, String passwordHash) {
        this.email = email;
        this.name = name;
        this.passwordHash = passwordHash;
    }
}

interface Accounts extends JpaRepository<Account, String> {}
