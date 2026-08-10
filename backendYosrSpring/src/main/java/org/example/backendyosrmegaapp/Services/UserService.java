package org.example.backendyosrmegaapp.Services;

import org.example.backendyosrmegaapp.entities.User;
import org.example.backendyosrmegaapp.entities.UserConversationResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserService {

//	public User addUser(User p);

//	public List<User> getListByport(Long id);

    public User editUser(User p);

    public User getUserById(Long id);

    public void deleteUserById(Long id);

    public List<User> getAllUsers();

    void resetPassword(String token, String newPassword);

    //	@Override
    //	public List<User> getListByport(Long id) {
    //		// TODO Auto-generated method stub
    //		return UserRepository.findList(id);
    //	}
    List<UserConversationResponse> getAllUsersForConversations();

    UserConversationResponse toConversationResponse(User user);
}