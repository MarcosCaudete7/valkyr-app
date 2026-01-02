package org.valkyrapp.api.service;

import org.springframework.transaction.annotation.Transactional;
import org.valkyrapp.api.dto.UserDTO;
import java.util.List;

public interface UserService {

    UserDTO saveUser(UserDTO userDTO);
    UserDTO getUserById(Long id);
    List<UserDTO> listAllUsers();
    void deleteUser(Long id);

    @Transactional(readOnly = true)
    UserDTO login(String username, String rawPassword);
}
