import requests
from datetime import datetime

def main():
    url = "https://nes.ubiquo.io/hooks/sanextodwt847rgeu1cygt1fuy"
    
    # Obtener el día actual del mes
    current_day = datetime.now().day
    
    # Definir el mensaje según el día
    if current_day == 9:
        message = "📢 Recordatorio: El día 12 es la fecha límite para enviar las facturas de este mes. ¡No lo olvides! 📢 Ten en cuenta que el día 12 es el último día para enviar las facturas de este mes."
    elif current_day == 12:
        message = "🚨 ¡ÚLTIMO DÍA! Hoy es la fecha límite para enviar las facturas de este mes. Si no las envías hoy, no se procesarán los pagos 🚨"
    else:
        return

    body = {
        "channel": "soporteubiquo",
        "username": "Facturas-Bot",
        "icon_url": "https://valorantinfo.com/images/us/bunny-hop-spray_valorant_gif_3789.gif",
        "text": message
    }

    r = requests.post(url, json=body)
    if r.status_code != 200:
        print(f"Error al enviar mensaje: {r.text}")

if __name__ == "__main__":
    main()


