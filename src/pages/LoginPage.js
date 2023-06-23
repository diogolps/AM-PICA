import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, firestore } from "../firebase";
import { Grid } from "@mui/material";
import Stack from "@mui/material/Stack";
import "./style.css";
import Input from "../components/Input";

const LoginPage = ({ setLoggedIn }) => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const { email, password } = data;
      await auth.signInWithEmailAndPassword(email, password);

      const user = auth.currentUser;
      const userRef = firestore.collection("users").doc(user.uid);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        if (userData.isAdmin) {
          navigate("/admin");
        } else {
          navigate("/user");
        }
      }

      toast.success("Login com sucesso!"); // Notificação de sucesso
    } catch (error) {
      toast.error("Credenciais Inválidas!"); // Notificação de erro
      console.log(error);
    }
  };

  const handleRegister = () => {
    navigate("/registo");
  };

  return (
    <div style={{ height: "100vh" }} className="container">
      <Grid container style={{ height: "100%" }} className="background">
        <Grid item xs={9}></Grid>
        <Grid
          item
          xs={3}
          sx={{ backgroundColor: "#4c3c2d" }}
          className="containerlogin"
        >
          <Stack spacing={2} className="conteudoLogin">
            <div className="paddingConteudo">
              <div>
                <h2 className="h2Login">Login:</h2>
              </div>
              <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="textLogin">Email</div>
                  <Input
                    type="email"
                    name="email"
                    register={register}
                    required
                  />
                  <div className="textLogin2">Password</div>
                  <Input
                    type="password"
                    name="password"
                    register={register}
                    required
                  />
                </form>
              </div>
            </div>
            <div>
              <Grid>
                <Grid item xs>
                  <Stack spacing={1} className="botoes">
                    <div>
                      <button
                        onClick={handleSubmit(onSubmit)}
                        type="submit"
                        className="botaologin"
                      >
                        LOGIN
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={handleRegister}
                        className="botaoregistar"
                      >
                        REGISTAR
                      </button>
                    </div>
                  </Stack>
                </Grid>
              </Grid>
            </div>
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
};

export default LoginPage;
