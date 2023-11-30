/// En controllers/DriverController.js
const { Driver, Team, sequelize } = require("../db");
// const readJsonFile = require("../../api/db.json");

const driverController = {
  getAllDrivers: async (req, res) => {
    try {
      // Obtener datos desde el archivo JSON (simulando una API) usando fetch
      const response = await fetch("http://localhost:5000/api/db.json"); // Ajusta la URL según la ubicación de tu archivo
      const driversFromJson = await response.json();

      // Obtener todos los drivers de la base de datos
      const driversFromDB = await Driver.findAll({
        include: [{ model: Team }],
      });

      // Combinar los drivers de la API y la base de datos
      const allDrivers = [...driversFromJson.drivers, ...driversFromDB];

      // Agregar imagen por defecto a los drivers que no la tienen
      const driversWithDefaultImage = allDrivers.map((driver) => ({
        ...driver,
        image: driver.image || {
          url: "imagen_por_defecto.jpg",
          imageby: "Desconocido",
        },
      }));

      res.json(driversWithDefaultImage);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al obtener los conductores" });
    }
  },

  getDriverById: async (req, res) => {
    try {
      const { idDriver } = req.params;

      // Intentar obtener el conductor de la base de datos por ID
      const driverFromDB = await Driver.findByPk(idDriver, {
        include: [{ model: Team }],
      });

      if (driverFromDB) {
        // Agregar imagen por defecto si no tiene
        driverFromDB.image = driverFromDB.image || {
          url: "imagen_por_defecto.jpg",
          imageby: "Desconocido",
        };

        res.json(driverFromDB);
      } else {
        // Si no se encuentra en la base de datos, buscar en el archivo JSON (simulando una API) usando fetch
        const response = await fetch("http://localhost:5000/api/db.json"); // Ajusta la URL según la ubicación de tu archivo
        const driversFromJson = await response.json();
        const driverFromJson = driversFromJson.drivers.find(
          (driver) => driver.id === parseInt(idDriver)
        );

        if (driverFromJson) {
          // Agregar imagen por defecto si no tiene
          driverFromJson.image = driverFromJson.image || {
            url: "imagen_por_defecto.jpg",
            imageby: "Desconocido",
          };

          res.json(driverFromJson);
        } else {
          res.status(404).json({ error: "Driver no encontrado" });
        }
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Error al obtener el detalle del conductor" });
    }
  },

  searchDriversByName: async (req, res) => {
    try {
      const { name } = req.query;

      // Buscar drivers en la base de datos que coincidan con el nombre
      const driversFromDB = await Driver.findAll({
        where: {
          [Op.or]: [
            sequelize.where(
              sequelize.fn("LOWER", sequelize.col("name.forename")),
              "LIKE",
              `%${name.toLowerCase()}%`
            ),
            sequelize.where(
              sequelize.fn("LOWER", sequelize.col("name.surname")),
              "LIKE",
              `%${name.toLowerCase()}%`
            ),
          ],
        },
        limit: 15,
        include: [{ model: Team }],
      });

      // Buscar drivers en el archivo JSON (simulando una API) usando fetch
      const response = await fetch("http://localhost:5000/api/db.json"); // Ajusta la URL según la ubicación de tu archivo
      const driversFromJson = await response.json();
      const filteredDrivers = driversFromJson.drivers.filter(
        (driver) =>
          driver.name.forename.toLowerCase().includes(name.toLowerCase()) ||
          driver.name.surname.toLowerCase().includes(name.toLowerCase())
      );

      // Combinar resultados
      const searchResults = [...driversFromDB, ...filteredDrivers];

      if (searchResults.length > 0) {
        // Agregar imagen por defecto a los drivers que no la tienen
        const resultsWithDefaultImage = searchResults.map((driver) => ({
          ...driver,
          image: driver.image || {
            url: "imagen_por_defecto.jpg",
            imageby: "Desconocido",
          },
        }));
        res.json(resultsWithDefaultImage);
      } else {
        res
          .status(404)
          .json({ message: "No se encontraron resultados para la búsqueda." });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Error al buscar los conductores por nombre" });
    }
  },

  createDriver: async (req, res) => {
    try {
      const { forename, surname, teams } = req.body;

      // Crear un nuevo driver y relacionarlo con los teams indicados
      const newDriver = await Driver.create({
        name: { forename, surname },
        // ...otros campos del driver
      });

      await newDriver.addTeams(teams); // Relacionar el nuevo driver con los equipos

      res.json(newDriver);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al crear el nuevo conductor" });
    }
  },
};

module.exports = driverController;
