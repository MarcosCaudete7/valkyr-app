package org.valkyrapp.api.usuario;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserService {

    UserDTO saveUser(UserDTO userDTO);
    UserDTO getUserById(Long id);
    List<UserDTO> listAllUsers();
    void deleteUser(Long id);

    @Transactional(readOnly = true)
    UserDTO login(String username, String rawPassword);
}
