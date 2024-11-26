import { app } from "./app";

const PORT = process.env.PORT || 5555;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
