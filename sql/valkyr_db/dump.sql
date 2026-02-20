create schema valkyr_db;
use valkyr_db;

-- Este Dump de sql ha sido generado solo con el esquema de tablas
-- No incluye ningun tipo de datos inyectados en la tabla (Ejercicios, Usuarios, etc...)

create table exercises_catalog
(
    id           bigint auto_increment
        primary key,
    description  varchar(255) null,
    equipment    varchar(255) null,
    muscle_group varchar(255) not null,
    name         varchar(255) not null,
    constraint UK20pddk65j0rs1wwr7xp2rhv54
        unique (name)
);

create table users
(
    id         bigint auto_increment
        primary key,
    created_at datetime(6)  null,
    email      varchar(100) not null,
    full_name  varchar(255) null,
    password   varchar(255) not null,
    username   varchar(50)  not null,
    constraint UK6dotkott2kjsp8vw4d0m25fb7
        unique (email),
    constraint UKr43af9ap4edm43mmtq01oddj6
        unique (username)
);

create table routine
(
    id          bigint auto_increment
        primary key,
    created_at  datetime(6)  not null,
    description varchar(255) null,
    is_public   bit          not null,
    name        varchar(255) not null,
    user_id     bigint       null,
    constraint FKgrafrnx4qs7tt81du15xdicvw
        foreign key (user_id) references users (id)
);

create table exercise_tracker
(
    id           bigint auto_increment
        primary key,
    is_completed bit          null,
    name         varchar(255) null,
    reps         int          null,
    series       int          null,
    weight       double       null,
    routine_id   bigint       null,
    constraint FK69obfh0sg48bbq9r0unvslcdw
        foreign key (routine_id) references routine (id)
);

create table routine_muscles
(
    routine_id bigint                                                                              not null,
    muscles    enum ('ABS', 'BACK', 'BICEPS', 'CHESTS', 'FOREARMS', 'LEG', 'SHOULDERS', 'TRICEPS') null,
    constraint FK4ekqs09e0g68chhksoifiatsc
        foreign key (routine_id) references routine (id)
);


