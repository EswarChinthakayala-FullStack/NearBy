import io
import os
from typing import Dict, Any
from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
env = Environment(loader=FileSystemLoader(TEMPLATES_DIR))


def generate_itinerary_pdf_bytes(itinerary_data: Dict[str, Any]) -> bytes:
    """
    Renders an HTML Jinja2 template with itinerary data and compiles it into a high-quality PDF binary.
    """
    template = env.get_template("itinerary_pdf.html")

    # Render template with variables
    html_content = template.render(
        destination=itinerary_data.get("destination", "Tourist Destination"),
        recommended_duration=itinerary_data.get("recommended_duration", "2 Days / 1 Night"),
        estimated_cost=itinerary_data.get("estimated_cost", "Moderate"),
        summary=itinerary_data.get("summary", ""),
        days=itinerary_data.get("days", []),
        reasoning=itinerary_data.get("reasoning", []),
        packing_checklist=itinerary_data.get("packing_checklist", []),
        weather_advisory=itinerary_data.get("weather_advisory", ""),
        tips=itinerary_data.get("tips", []),
        emergency_contacts=itinerary_data.get("emergency_contacts", {}),
    )

    pdf_buffer = io.BytesIO()
    pisa_status = pisa.CreatePDF(io.StringIO(html_content), dest=pdf_buffer)

    if pisa_status.err:
        raise RuntimeError("Failed to generate PDF document from HTML/Jinja2 template.")

    return pdf_buffer.getvalue()
