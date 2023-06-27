import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, firestore } from "../firebase";
import { Grid, useTheme, useMediaQuery } from "@mui/material";
import Stack from "@mui/material/Stack";
import "./style.css";
import Input from "../components/Input";

const RegisterPage = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleRegister = async (data) => {
    try {
      const { name, email, password } = data;

      // Criar o usuário no Firebase Authentication
      const userCredential = await auth.createUserWithEmailAndPassword(
        email,
        password
      );
      const userId = userCredential.user.uid;

      // Salvar os dados do usuário no Firebase Firestore
      const userData = {
        name: name,
      };
      await firestore.collection("users").doc(userId).set(userData);

      toast.success("Registo realizado com sucesso!");
      navigate("/");
    } catch (error) {
      toast.error("Erro ao registar utilizador!");
      console.log(error);
    }
  };

  return (
    <div style={{ height: "100vh" }} className="container">
      <Grid container style={{ height: "100%" }} className="background">
        {!isMobile && (
          <Grid item xs={9}>
            {/* Content for non-mobile */}
          </Grid>
        )}
        <Grid
          item
          xs={12}
          sm={isMobile ? 12 : 3}
          sx={{ backgroundColor: "#4c3c2d" }}
          className="containerlogin"
        >
          <Stack spacing={2} className="conteudoLogin">
            <div className="paddingConteudo">
              <div>
                <h2 className="h2Login">Registo:</h2>
              </div>
              <div className="textLogin">Nome</div>
              <form onSubmit={handleSubmit(handleRegister)}>
                <Input type="text" name="name" register={register} required />
                <div className="textLogin2">Email</div>
                <Input type="email" name="email" register={register} required />
                <div className="textLogin2" style={{ fontFamily: "" }}>
                  Password
                </div>
                <Input
                  type="password"
                  name="password"
                  register={register}
                  required
                />
              </form>
            </div>
            <div>
              <Grid>
                <Grid item xs>
                  <Stack spacing={1} className="botoes">
                    <div>
                      <button
                        type="submit"
                        className="botaoRegistar2"
                        onClick={handleSubmit(handleRegister)}
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

export default RegisterPage;
