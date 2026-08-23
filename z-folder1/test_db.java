import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class test_db {
    public static void main(String[] args) throws Exception {
        Class.forName("com.mysql.cj.jdbc.Driver");
        Connection conn = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/flame_crust", "flame", "flame_password");
        PreparedStatement stmt = conn.prepareStatement("SELECT * FROM drivers WHERE email = 'chetdriver@gmail.com' AND status != 'SUSPENDED' LIMIT 1");
        ResultSet rs = stmt.executeQuery();
        if (rs.next()) {
            System.out.println("Driver found: " + rs.getString("email"));
            String hash = rs.getString("password_hash");
            System.out.println("Hash in DB: " + hash);
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            boolean match = encoder.matches("123456", hash);
            System.out.println("Matches 123456? " + match);
        } else {
            System.out.println("Driver not found or suspended.");
        }
        conn.close();
    }
}
