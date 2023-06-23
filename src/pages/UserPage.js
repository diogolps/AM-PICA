import React, { useEffect, useState } from "react";
import { auth, firestore } from "../firebase";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Container, Grid } from "@mui/material";
import "./styleUserPage.css";

const UserPage = ({ setLoggedIn }) => {
  const [userName, setUserName] = useState("");
  const [userRecords, setUserRecords] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/"); // Redirect the user to the login page
      } else {
        // Redirect the user to the user page if authenticated
        navigate("/user");
      }

      await fetchUserData();
    });

    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = firestore.collection("users").doc(user.uid);
          const userDoc = await userRef.get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            setUserName(userData.name);
            setUserRecords(userData.registos ? userData.registos : {});
          } else {
            const userData = {
              name: user.displayName,
              registos: {},
            };
            await userRef.set(userData);
            setUserName(user.displayName);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setLoggedIn(false); // Atualizar o estado loggedIn para false
      navigate("/"); // Redirecionar o usuário para a página inicial ("/")
    } catch (error) {
      console.log("Erro ao fazer logout:", error);
    }
  };

  const handleButtonClick = async (type) => {
    try {
      const user = auth.currentUser;
      const currentDate = new Date();
      const formattedDate = format(currentDate, "dd-MM-yyyy");

      const userRef = firestore.collection("users").doc(user.uid);

      await firestore.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (userDoc.exists) {
          const userData = userDoc.data();

          if (
            userData.registos &&
            userData.registos[formattedDate] &&
            userData.registos[formattedDate][type]
          ) {
            console.log("Button already clicked for today.");
            return;
          }

          const newRecord = {
            hora: format(currentDate, "HH:mm:ss"),
            tipo: type,
          };

          if (!userData.registos || !userData.registos[formattedDate]) {
            userData.registos = {
              ...userData.registos,
              [formattedDate]: {},
            };
          }

          userData.registos[formattedDate][type] = newRecord;

          transaction.update(userRef, userData);

          setUserRecords(userData.registos ? userData.registos : {});
        }
      });

      console.log("Dados registrados com sucesso!");
    } catch (error) {
      console.log("Erro ao registrar dados:", error);
    }
  };

  const getHourForType = (type) => {
    const record = sortedRecords.find((r) => r.type === type);
    return record ? record.hora : "";
  };

  const getSortedRecords = () => {
    const currentDate = new Date();
    const formattedDate = format(currentDate, "dd-MM-yyyy");

    let sortedRecords = [];
    if (userRecords[formattedDate]) {
      const records = userRecords[formattedDate];
      for (const type in records) {
        sortedRecords.push({
          date: formattedDate,
          type,
          ...records[type],
        });
      }
      sortedRecords.sort((a, b) => {
        return a.hora.localeCompare(b.hora);
      });
    }

    // Filter out records without a valid hour value
    sortedRecords = sortedRecords.filter((record) => record.hora);

    return sortedRecords;
  };

  const sortedRecords = getSortedRecords();

  return (
    <div className="containerUserPage">
      <Container maxWidth="xl">
        <Grid container className="titulos">
          <Grid item xs={6}>
            <h2>Bem-vindo(a), {userName}!</h2>
          </Grid>
          <Grid item xs={6} className="logout">
            <button onClick={handleLogout} className="logoutButton">
              Logout
            </button>
          </Grid>
        </Grid>
        <Grid container className="containerBotoes">
          <Grid item xs={2}></Grid>
          <Grid item xs={8} className="botoesUserPage">
            <button
              onClick={() => handleButtonClick("Entrada")}
              className="botoesRegistar"
            >
              Entrada
            </button>
            <button
              onClick={() => handleButtonClick("Saída Almoço")}
              className="botoesRegistar"
            >
              Saída Almoço
            </button>
            <button
              onClick={() => handleButtonClick("Entrada Almoço")}
              className="botoesRegistar"
            >
              Entrada Almoço
            </button>
            <button
              onClick={() => handleButtonClick("Saída")}
              className="botoesRegistar"
            >
              Saída
            </button>
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>
        <h3>Registos:</h3>
        <Grid container className="containerTabela">
          <Grid item xs={2}></Grid>
          <Grid item xs={8}>
            <table className="tabela">
              <thead>
                <tr>
                  <th>Entrada</th>
                  <th>Saída Almoço</th>
                  <th>Entrada Almoço</th>
                  <th>Saída</th>
                </tr>
              </thead>
              <tbody>
                <tr className="horasregistoTR">
                  <td>
                    <div className="horasRegisto">
                      <div className="horasRegisto2">
                        {getHourForType("Entrada")}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="horasRegisto">
                      <div className="horasRegisto2">
                        {getHourForType("Saída Almoço")}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="horasRegisto">
                      <div className="horasRegisto2">
                        {getHourForType("Entrada Almoço")}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="horasRegisto">
                      <div className="horasRegisto2">
                        {getHourForType("Saída")}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default UserPage;
