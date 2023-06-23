import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, firestore } from "../firebase";
import { parse, startOfDay, endOfDay, format } from "date-fns";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { Container, Grid } from "@mui/material";
import "./styleAdminPage.css";

const AdminPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([{ id: "all", name: "Todos" }]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [filteredRecords, setFilteredRecords] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await firestore.collection("users").get();
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const filteredUsers = usersData.filter(
          (user) => user.name.toLowerCase() !== "admin"
        ); // Remove the user with the name "Admin"
        const allOption = { id: "all", name: "Todos" };
        setUsers([allOption, ...filteredUsers]);
      } catch (error) {
        console.log("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const checkUserAuth = () => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (!user) {
          navigate("/login"); // Redirect to login page if user is not logged in
        }
      });

      return unsubscribe;
    };

    return checkUserAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };

  const handleSearch = () => {
    const filtered = users.filter((user) => {
      const userMatch =
        selectedUser === null ||
        selectedUser.value === "all" ||
        selectedUser.value === user.id;
      const recordsMatch =
        (!selectedStartDate && !selectedEndDate) ||
        Object.keys(user.registos || {}).some((date) => {
          const currentDate = parse(date, "dd-MM-yyyy", new Date());
          const startDate = selectedStartDate
            ? startOfDay(selectedStartDate)
            : null;
          const endDate = selectedEndDate ? endOfDay(selectedEndDate) : null;
          return (
            (!startDate || currentDate >= startDate) &&
            (!endDate || currentDate <= endDate)
          );
        });
      return userMatch && recordsMatch;
    });

    const filteredRecords = filtered.map((user) => {
      const filteredDates = Object.entries(user.registos || {}).filter(
        ([date]) => {
          const currentDate = parse(date, "dd-MM-yyyy", new Date());
          const startDate = selectedStartDate
            ? startOfDay(selectedStartDate)
            : null;
          const endDate = selectedEndDate ? endOfDay(selectedEndDate) : null;
          return (
            (!startDate || currentDate >= startDate) &&
            (!endDate || currentDate <= endDate)
          );
        }
      );

      const sortedDates = filteredDates.sort(([date1], [date2]) => {
        const parsedDate1 = parse(date1, "dd-MM-yyyy", new Date());
        const parsedDate2 = parse(date2, "dd-MM-yyyy", new Date());
        return parsedDate1 - parsedDate2;
      });

      const sortedRecords = sortedDates.reduce((acc, [date, records]) => {
        const sortedRecords = Object.values(records || {}).sort(
          (record1, record2) => {
            const parsedTime1 = parse(record1.hora, "HH:mm:ss", new Date());
            const parsedTime2 = parse(record2.hora, "HH:mm:ss", new Date());
            return parsedTime1.getTime() - parsedTime2.getTime();
          }
        );

        const sortedEntries = sortedRecords.reduce(
          (entries, record) => {
            if (record.tipo === "Entrada") {
              entries.entradas.push(record);
            } else if (record.tipo === "Saída Almoço") {
              entries.saidasAlmoco.push(record);
            } else if (record.tipo === "Entrada Almoço") {
              entries.entradasAlmoco.push(record);
            } else if (record.tipo === "Saída") {
              entries.saidas.push(record);
            }
            return entries;
          },
          { entradas: [], saidasAlmoco: [], entradasAlmoco: [], saidas: [] }
        );

        return { ...acc, [date]: sortedEntries };
      }, {});

      return {
        ...user,
        registos: sortedRecords,
      };
    });

    setFilteredRecords(filteredRecords);
  };

  const MyDocument = () => {
    const styles = StyleSheet.create({
      page: {
        flexDirection: "row",
        backgroundColor: "#E4E4E4",
      },
      section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
      },
      table: {
        display: "table",
        width: "100%",
        borderStyle: "solid",
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginBottom: 10,
      },
      tableRow: {
        margin: "auto",
        flexDirection: "row",
      },
      tableColHeader: {
        width: "20%",
        borderStyle: "solid",
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderRightWidth: 1,
        backgroundColor: "#F0F0F0",
        textAlign: "center",
        padding: 5,
        fontSize: 12,
        fontWeight: "bold",
      },

      tableColText: {
        fontSize: 12,
        width: "20%",
        borderStyle: "solid",
        borderBottomWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderRightWidth: 1,
        textAlign: "center",
        padding: 5, // Defina o tamanho de fonte desejado
      },
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            {filteredRecords.map((user) => {
              if (user.id === "all") {
                return null; // Ignorar a renderização da tabela "Todos"
              }

              return (
                <View key={user.id}>
                  <Text style={{ fontSize: 12, marginBottom: 10 }}>
                    {user.name}
                  </Text>
                  <View style={styles.table}>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableColHeader}>Data</Text>
                      <Text style={styles.tableColHeader}>Entrada</Text>
                      <Text style={styles.tableColHeader}>Saída Almoço</Text>
                      <Text style={styles.tableColHeader}>Entrada Almoço</Text>
                      <Text style={styles.tableColHeader}>Saída</Text>
                    </View>
                    {Object.entries(user.registos || {}).map(
                      ([date, entries]) =>
                        Array.isArray(entries.entradas) &&
                        Array.isArray(entries.saidasAlmoco) &&
                        Array.isArray(entries.entradasAlmoco) &&
                        Array.isArray(entries.saidas) && (
                          <View style={styles.tableRow} key={date}>
                            <Text style={styles.tableColText}>{date}</Text>
                            <Text style={styles.tableColText}>
                              {entries.entradas.length > 0
                                ? entries.entradas
                                    .map((entry) => entry.hora)
                                    .join(", ")
                                : "-"}
                            </Text>
                            <Text style={styles.tableColText}>
                              {entries.saidasAlmoco.length > 0
                                ? entries.saidasAlmoco
                                    .map((entry) => entry.hora)
                                    .join(", ")
                                : "-"}
                            </Text>
                            <Text style={styles.tableColText}>
                              {entries.entradasAlmoco.length > 0
                                ? entries.entradasAlmoco
                                    .map((entry) => entry.hora)
                                    .join(", ")
                                : "-"}
                            </Text>
                            <Text style={styles.tableColText}>
                              {entries.saidas.length > 0
                                ? entries.saidas
                                    .map((entry) => entry.hora)
                                    .join(", ")
                                : "-"}
                            </Text>
                          </View>
                        )
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </Page>
      </Document>
    );
  };

  return (
    <div className="containerAdminPage">
      <Container maxWidth="xl">
        <Grid container className="titulos">
          <Grid item xs={6}>
            <h2>Admin Page</h2>
          </Grid>
          <Grid item xs={6} className="logout">
            <button onClick={handleLogout} className="logoutButton">
              Logout
            </button>
          </Grid>
        </Grid>
        <div>
          <h2>Bem-vindo, admin!</h2>
        </div>

        <div>
          <Select
            className="select"
            options={users.map((user) => ({
              value: user.id,
              label: user.name,
            }))}
            value={selectedUser}
            onChange={(selectedOption) => setSelectedUser(selectedOption)}
            placeholder="Selecione utilizador"
          />
          <Grid container className="containerDatas">
            <Grid item xs={3}></Grid>
            <Grid item xs={3} className="data1">
              <DatePicker
                selected={selectedStartDate}
                onChange={(date) => setSelectedStartDate(date)}
                placeholderText="Data de início"
                dateFormat="dd-MM-yyyy" // Set date format to "dd-MM-yyyy"
              />
            </Grid>
            <Grid item xs={3} className="data2">
              <DatePicker
                selected={selectedEndDate}
                onChange={(date) => setSelectedEndDate(date)}
                placeholderText="Data de fim"
                dateFormat="dd-MM-yyyy" // Set date format to "dd-MM-yyyy"
              />
            </Grid>
            <Grid item xs={3}></Grid>
          </Grid>
          <div className="pesquisa">
            <button className="botaoPesquisa" onClick={handleSearch}>
              PESQUISAR
            </button>
          </div>
          <div className="download">
            <PDFDownloadLink
              className="linkDownload"
              document={<MyDocument />}
              fileName="registos.pdf"
              style={{ marginLeft: 10 }}
            >
              {({ loading }) => (loading ? "Loading..." : "DOWNLOAD PDF")}
            </PDFDownloadLink>
          </div>
        </div>
        {filteredRecords.map((user) => {
          if (user.name === "Todos") {
            return null; // Ignorar a renderização da tabela "Todos"
          }

          return (
            <Grid key={user.id} container className="containerTabela">
              <Grid item xs={1}></Grid>
              <Grid item xs={10} className="containerTabela">
                <div key={user.id}>
                  <div className="nome">
                    <h4> Nome: {user.name}</h4>
                  </div>
                  <table className="tabela">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Entrada</th>
                        <th>Saída Almoço</th>
                        <th>Entrada Almoço</th>
                        <th>Saída</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(user.registos || {}).map(
                        ([date, entries]) => (
                          <tr key={date}>
                            <td className="data">
                              <div>{date}</div>
                            </td>
                            <td className="horas">
                              {entries.entradas.length > 0 ? (
                                entries.entradas.map((entry) => (
                                  <div key={entry.hora}>{entry.hora}</div>
                                ))
                              ) : (
                                <div>-</div>
                              )}
                            </td>
                            <td className="horas">
                              {entries.saidasAlmoco.length > 0 ? (
                                entries.saidasAlmoco.map((entry) => (
                                  <div key={entry.hora}>{entry.hora}</div>
                                ))
                              ) : (
                                <div>-</div>
                              )}
                            </td>
                            <td className="horas">
                              {entries.entradasAlmoco.length > 0 ? (
                                entries.entradasAlmoco.map((entry) => (
                                  <div key={entry.hora}>{entry.hora}</div>
                                ))
                              ) : (
                                <div>-</div>
                              )}
                            </td>
                            <td className="horas">
                              {entries.saidas.length > 0 ? (
                                entries.saidas.map((entry) => (
                                  <div key={entry.hora}>{entry.hora}</div>
                                ))
                              ) : (
                                <div>-</div>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </Grid>
              <Grid item xs={1}></Grid>
            </Grid>
          );
        })}
      </Container>
    </div>
  );
};

export default AdminPage;
