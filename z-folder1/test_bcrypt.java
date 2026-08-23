import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
public class test_bcrypt {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.matches("123456", "$2a$10$Y3Hl9nF/.r4Qe8xH.yXbDO/0X6vG2p.8/c53kZ0iH4q27YJ.tE73W"));
    }
}
