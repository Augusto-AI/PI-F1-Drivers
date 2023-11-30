// En controllers/TeamController.js
const { Team } = require("../db");
const axios = require("axios");

const teamController = {
  getAllTeams: async (req, res) => {
    try {
      // Obtener todos los equipos de la base de datos
      const teamsFromDB = await Team.findAll();

      // Si la base de datos está vacía, obtener equipos de la API
      if (teamsFromDB.length === 0) {
        const apiResponse = await axios.get("http://api.com/teams"); // Reemplaza con la URL correcta de tu API
        const teamsFromAPI = apiResponse.data;

        // Guardar los equipos obtenidos de la API en la base de datos
        await Team.bulkCreate(teamsFromAPI);
      }

      // Obtener y enviar la respuesta con todos los equipos
      const teams = await Team.findAll();
      res.json(teams);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener los equipos" });
    }
  },
};

module.exports = teamController;
