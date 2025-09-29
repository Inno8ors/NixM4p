
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                                                                                       # NixM4P                                                                                                  -
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Plataforma de monitoreo del transporte publico en Nicaragua, en tiempo real.

##  Descripcion.

NixM4P es un sistema inclusivo que permite a los usuarios visualizar en tiempo real la ubicacion y estado de las unidades de transporte urbano e intermunicipal en Nicaragua.

Utiliza **Raspberry Pi, GPS (NMEA), Firebase y Leaflet.js** para mostrar recorridos, alertas y tiempos estimados de llegada, mejorando la seguridad, accesibilidad y confianza de los pasajeros.

##  Caracteristicas principales.

* Seguimiento en tiempo real de buses mediante GPS.
* Visualizacion de rutas a nivel **municipal, departamental y nacional**.
* Panel administrativo para autoridades (**IRTRAMMA**) con control y supervision.
* Interfaz accesible e inclusiva para usuarios.
* Alertas de incidencias y retrasos.

##  Tecnologias utilizadas

* **Frontend:** HTML, CSS, JavaScript, Leaflet.js
* **Backend:** Firebase Realtime Database
* **Hardware:** Raspberry Pi + GPS (NMEA)
* **Otros:** APIs de geolocalizacion y mapas

##  Estructura del proyecto

```
NixM4P/
│── index.html        # Interfaz principal del usuario
│── admin-panel.html  # Panel de autoridades (IRTRAMMA)
│── css/
│   └── styles.css    # Estilos
│── js/
│   └── app.js        # Logica principal
│── assets/
│   └── img/          # Iconos, logos, etc.
│── README.md         # Documentacion del proyecto
```

## Instalacion y ejecucion

1. Clona este repositorio:

   ```bash
   git clone https://github.com/Inno8ors/NixM4p.git
   cd nixm4p
   ```
2. Configura tu **Firebase Realtime Database** y coloca las credenciales en `app.js`.
3. Abre `index.html` en tu navegador para iniciar el sistema.

##  Casos de uso

* **Usuarios:** ver rutas y tiempos estimados de llegada de buses en tiempo real.
* **Autoridades (IRTRAMMA):** gestionar alertas, supervisar flota y generar reportes.
* **Conductores/Autobuses:** enviar datos de posicion en tiempo real via Raspberry Pi + GPS.

##  Equipo de desarrollo

* Ernesto Jose Zelaya Schwartz.
* Jahnny Hassel Ponce Gutierrez.
* Freddy Enmanuel Mairena Gutierrez.
* Ulises de Jesus Valdivia Ponce.
* Albert Jered Sobalvarro Chavarria.

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT, IRTRAMA y Asociados.

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                                                                                _Propiedad de NixM4p_                                                                                         -
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
