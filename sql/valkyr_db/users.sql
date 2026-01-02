create table valkyr_db.users
(
    id         bigint auto_increment
        primary key,
    username   varchar(50)                         not null,
    email      varchar(100)                        not null,
    password   varchar(255)                        not null,
    full_name  varchar(100)                        null,
    created_at timestamp default CURRENT_TIMESTAMP null,
    updated_at timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint email
        unique (email),
    constraint username
        unique (username),
    constraint username_2
        unique (username)
);

