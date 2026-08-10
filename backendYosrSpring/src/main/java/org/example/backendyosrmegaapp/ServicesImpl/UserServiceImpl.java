package org.example.backendyosrmegaapp.ServicesImpl;

import org.example.backendyosrmegaapp.Repositories.PasswordResetTokenRepository;
import org.example.backendyosrmegaapp.Repositories.UserRepository;
import org.example.backendyosrmegaapp.Services.UserService;
import org.example.backendyosrmegaapp.entities.PasswordResetToken;
import org.example.backendyosrmegaapp.entities.User;
import org.example.backendyosrmegaapp.entities.UserConversationResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository UserRepository;



    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;



    @Override
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token);
        if (resetToken == null || resetToken.getExpirationTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired token");
        }

        User user = resetToken.getUser();
        user.setPassword(newPassword);
        UserRepository.save(user);

        // Clean up token after reset
        passwordResetTokenRepository.delete(resetToken);
    }







//	@Override
//	public User addUser(User p) {
//		// TODO Auto-generated method stub
//		return UserRepository.save(p);
//	}

    @Override
    public User editUser(User p) {
        // TODO Auto-generated method stub
        return UserRepository.save(p);
    }

    @Override
    public User getUserById(Long id) {
        // TODO Auto-generated method stub
        Optional<User> user=UserRepository.findById(id);
        return user.isPresent() ? user.get(): null;
    }

    @Override
    public void deleteUserById(Long id) {
        // TODO Auto-generated method stub
        UserRepository.deleteById(id);

    }

    @Override
    public List<User> getAllUsers() {
        // TODO Auto-generated method stub
        return UserRepository.findAll();
    }

//	@Override
//	public List<User> getListByport(Long id) {
//		// TODO Auto-generated method stub
//		return UserRepository.findList(id);
//	}
@Override
public List<UserConversationResponse> getAllUsersForConversations() {

        return UserRepository.findAll()
                .stream()
                .map(this::toConversationResponse)
                .toList();
    }
    @Override
    public UserConversationResponse toConversationResponse(User user) {

        return UserConversationResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .profileImage(user.getProfileImage())
                .userType(
                        user.getUserType() != null
                                ? user.getUserType().name()
                                : null
                )
                .build();
    }



}
