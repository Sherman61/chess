<?php
session_start();

require_once(__DIR__ . "/backend/config.php");
include("functions.php");
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/php_errors.log');


if($_SERVER['REQUEST_METHOD'] == "POST")
{
    //something was posted
    $user_name = $_POST['user_name'];
    $password = $_POST['password'];

    if(!empty($user_name) && !empty($password) && !is_numeric($user_name) && isset($_POST['agree']))
    {
        $password = password_hash($password, PASSWORD_DEFAULT);
        //check if the user_name already exists
        $stmt = $con->prepare("SELECT user_name FROM users WHERE user_name = ?");
        $stmt->bind_param("s", $user_name);
        $stmt->execute();
        $result = $stmt->get_result();
        $stmt->close();

        if ($result->num_rows > 0) {
            // user_name already exists
            $error = "Error: This email address is already registered. Please try again with a different email address.";
        } else {
            //save to database
            $user_id = random_num(20);
            $query = "insert into users (user_id,user_name,password) values ('$user_id','$user_name','$password')";

            mysqli_query($con, $query);

            header("Location: login.html");
            die;
        }
    } else {
        $error = "Please enter valid information in all fields and agree to the terms and conditions.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<style type="text/css">
#button{
    padding: 10px;
    color: white;
    background-color: Lightblue;
    border: none;
}
::placeholder{
    color: #333;
    opacity: 1;
}

.agree-checkbox {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

.agree-label {
  font-size: 16px;
  color: #333;
  display: inline-block;
  margin-top: 5px;
}

.agree-link {
  color: blue;
  text-decoration: underline;
}
</style>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign Up</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="full-screen-container">
    <div class="login-container">
      <h1 class="login-title">Sign Up</h1>

      <form class="form"  method="post">
        <div class="input-group success">
          <input id="username" type="email" name="user_name" require placeholder="Email">
        </div>
        <div class="input-group error">
          <input id="password" type="password" name="password" pattern=".{8,}" title="8 characters minimum" required placeholder="Password">
        </div>
        <?php if(isset($error)): ?>
        <p style="color: red;"><?php echo $error; ?></p>
        <?php endif; ?>
        <div class="input-group">
   
    <label for="agree" class="agree-label">I agree to the <a href="#" class="agree-link">terms and conditions</a>.</label>
    <input type="checkbox" name="agree" id="agree" class="agree-checkbox" required>
</div>
        <button id="button" type="submit" value="Signup" name="submit" class="login-button">Submit</button>
        <a href="login.html">Click to Login</a><br><br>
      </form>
    </div>
  </div>
</body>
</html>