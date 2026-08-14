import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";

interface Juego {
  id: number;
  titulo: string;
  desarrollador: string;
  año: number;
  disponible: boolean;
}

const juegos: Juego[] = [
  {
    id: 1,
    titulo: "Need for Speed: Most Wanted",
    desarrollador: "EA Canada",
    año: 2005,
    disponible: true,
  },
  {
    id: 2,
    titulo: "Halo: Combat Evolved",
    desarrollador: "Bungie",
    año: 2001,
    disponible: true,
  },
  {
    id: 3,
    titulo: "The Witcher 3: Wild Hunt",
    desarrollador: "CD Projekt Red",
    año: 2015,
    disponible: false,
  },
  {
    id: 4,
    titulo: "Super Mario Odyssey",
    desarrollador: "Nintendo",
    año: 2017,
    disponible: true,
  },
  {
    id: 5,
    titulo: "Red Dead Redemption 2",
    desarrollador: "Rockstar Games",
    año: 2018,
    disponible: false,
  },
  {
    id: 6,
    titulo: "Cyberpunk 2077",
    desarrollador: "CD Projekt Red",
    año: 2020,
    disponible: true,
  },
];

const puerto = 3000;

function responder(
  res: ServerResponse,
  codigo: number,
  datos?: unknown
) {
  if (codigo === 204) {
    res.writeHead(204);
    res.end();
    return;
  }

  res.writeHead(codigo, {
    "Content-Type": "application/json; charset=utf-8",
  });

  res.end(JSON.stringify(datos));
}

async function leerBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk: Uint8Array | string) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        if (!body.trim()) {
          resolve({});
          return;
        }
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("JSON inválido"));
      }
    });

    req.on("error", (error: Error) => {
      reject(error);
    });
  });
}

const servidor = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const metodo = req.method || "GET";

    if (metodo === "GET" && url.pathname === "/api/health") {
      responder(res, 200, {
        mensaje: "Servidor de videojuegos funcionando",
        estado: "ok",
        juegosEnMemoria: juegos.length,
      });
      return;
    }

    if (metodo === "GET" && url.pathname === "/api/juegos") {
      const devParam = url.searchParams.get("desarrollador") || url.searchParams.get("developer");
      const disponibleParam = url.searchParams.get("disponible") || url.searchParams.get("available");

      let resultado = [...juegos];

      if (devParam) {
        const normalizar = (texto: string) =>
          texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

        const queryDev = normalizar(devParam);
        resultado = resultado.filter((j) => normalizar(j.desarrollador).includes(queryDev));
      }

      if (disponibleParam) {
        if (disponibleParam !== "true" && disponibleParam !== "false") {
          responder(res, 400, { mensaje: "El parámetro disponible debe ser 'true' o 'false'" });
          return;
        }
        const esDisponible = disponibleParam === "true";
        resultado = resultado.filter((j) => j.disponible === esDisponible);
      }

      responder(res, 200, {
        datos: resultado,
        total: resultado.length,
      });
      return;
    }

    if (metodo === "POST" && url.pathname === "/api/juegos") {
      const body = (await leerBody(req)) as Record<string, unknown>;

      if (typeof body !== "object" || body === null || Array.isArray(body)) {
        responder(res, 400, { mensaje: "El body debe ser un objeto JSON válido" });
        return;
      }

      const titulo = (body.titulo ?? body.title) as string;
      const desarrollador = (body.desarrollador ?? body.developer) as string;
      const año = (body.año ?? body.releaseYear) as number;
      const disponible = (body.disponible ?? body.available) as boolean;
      const añoActual = new Date().getFullYear();

      if (typeof titulo !== "string" || titulo.trim() === "") {
        responder(res, 400, { mensaje: "El título es obligatorio y no puede estar vacío" });
        return;
      }

      if (typeof desarrollador !== "string" || desarrollador.trim() === "") {
        responder(res, 400, { mensaje: "El desarrollador es obligatorio y no puede estar vacío" });
        return;
      }

      if (typeof año !== "number" || !Number.isInteger(año) || año < 1970 || año > añoActual) {
        responder(res, 400, { mensaje: `El año debe ser un número entero entre 1970 y ${añoActual}` });
        return;
      }

      if (typeof disponible !== "boolean") {
        responder(res, 400, { mensaje: "El campo disponible debe ser booleano (true o false)" });
        return;
      }

      const idMaximo = juegos.reduce((max, j) => (j.id > max ? j.id : max), 0);
      const nuevoJuego: Juego = {
        id: idMaximo + 1,
        titulo: titulo.trim(),
        desarrollador: desarrollador.trim(),
        año,
        disponible,
      };

      juegos.push(nuevoJuego);
      responder(res, 201, { datos: nuevoJuego });
      return;
    }

    if (url.pathname.startsWith("/api/juegos/")) {
      const partes = url.pathname.split("/").filter(Boolean);

      if (partes.length === 3) {
        const idTexto = partes[2]!;
        const id = Number(idTexto);

        if (!/^\d+$/.test(idTexto) || isNaN(id) || id <= 0) {
          responder(res, 400, { mensaje: "El ID debe ser un número entero positivo" });
          return;
        }

        if (metodo === "GET") {
          const juego = juegos.find((j) => j.id === id);

          if (!juego) {
            responder(res, 404, { mensaje: "Juego no encontrado" });
            return;
          }

          responder(res, 200, { datos: juego });
          return;
        }

        if (metodo === "PATCH") {
          const indice = juegos.findIndex((j) => j.id === id);

          if (indice === -1) {
            responder(res, 404, { mensaje: "Juego no encontrado" });
            return;
          }

          const body = (await leerBody(req)) as Record<string, unknown>;

          if (typeof body !== "object" || body === null || Array.isArray(body) || Object.keys(body).length === 0) {
            responder(res, 400, { mensaje: "El body debe contener al menos un campo a actualizar" });
            return;
          }

          if ("id" in body) {
            responder(res, 400, { mensaje: "No está permitido modificar el id del juego" });
            return;
          }

          const juegoExistente = juegos[indice]!;
          const juegoActualizado = { ...juegoExistente };

          if ("titulo" in body || "title" in body) {
            const val = (body.titulo ?? body.title) as string;
            if (typeof val !== "string" || val.trim() === "") {
              responder(res, 400, { mensaje: "El título no puede estar vacío" });
              return;
            }
            juegoActualizado.titulo = val.trim();
          }

          if ("desarrollador" in body || "developer" in body) {
            const val = (body.desarrollador ?? body.developer) as string;
            if (typeof val !== "string" || val.trim() === "") {
              responder(res, 400, { mensaje: "El desarrollador no puede estar vacío" });
              return;
            }
            juegoActualizado.desarrollador = val.trim();
          }

          if ("año" in body || "releaseYear" in body) {
            const val = (body.año ?? body.releaseYear) as number;
            const añoActual = new Date().getFullYear();
            if (typeof val !== "number" || !Number.isInteger(val) || val < 1970 || val > añoActual) {
              responder(res, 400, { mensaje: `El año debe ser entre 1970 y ${añoActual}` });
              return;
            }
            juegoActualizado.año = val;
          }

          if ("disponible" in body || "available" in body) {
            const val = (body.disponible ?? body.available) as boolean;
            if (typeof val !== "boolean") {
              responder(res, 400, { mensaje: "El campo disponible debe ser booleano" });
              return;
            }
            juegoActualizado.disponible = val;
          }

          juegos[indice] = juegoActualizado;
          responder(res, 200, { datos: juegoActualizado });
          return;
        }

        if (metodo === "DELETE") {
          const indice = juegos.findIndex((j) => j.id === id);

          if (indice === -1) {
            responder(res, 404, { mensaje: "Juego no encontrado" });
            return;
          }

          juegos.splice(indice, 1);
          responder(res, 204);
          return;
        }
      }
    }

    responder(res, 404, { mensaje: "Ruta no encontrada" });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "JSON inválido") {
      responder(res, 400, { mensaje: "El body contiene un JSON inválido" });
      return;
    }

    console.error("Error inesperado:", error);
    responder(res, 500, { mensaje: "Error interno del servidor" });
  }
});

servidor.listen(puerto, () => {
  console.log(`Servidor de videojuegos iniciado en http://localhost:${puerto}`);
});