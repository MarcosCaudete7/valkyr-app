package org.valkyrapp.api.service;

import org.springframework.transaction.annotation.Transactional;
import org.valkyrapp.api.dto.UserDTO;
import org.valkyrapp.api.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {

    UserDTO saveUser(UserDTO userDTO);
    UserDTO getUserById(Long id);
    List<UserDTO> listAllUsers();
    void deleteUser(Long id);

    @Transactional(readOnly = true)
    UserDTO login(String username, String rawPassword);
}
