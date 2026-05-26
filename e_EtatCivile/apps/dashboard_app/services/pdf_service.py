

from fpdf import FPDF
import os
import io

from apps.dashboard_app.models import (
    Acte, ActePersonne, ActeNaissance, ActeMariage, ActeDeces, Demande
)
from apps.dashboard_app.services.Acte_service import generer_qr_code


# Chemins 


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

STATIC_DIR     = os.path.join(BASE_DIR, 'dashboard_app', 'static', 'images')
LOGO_PATH      = os.path.join(STATIC_DIR, 'logo.png')
SIGNATURE_PATH = os.path.join(STATIC_DIR, 'signature.png')

# Utilitaires

MOIS_FR = [
    '', 'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'
]

MOIS_MG = [
    '', 'Janoary', 'Febroary', 'Martsa', 'Aprily', 'Mey', 'Jona',
    'Jolay', 'Aogositra', 'Septambra', 'Oktobra', 'Novambra', 'Desambra'
]

def fmt_date(dt, lang='mg'):
    if dt is None:
        return "N/A"
    try:
        mois = MOIS_MG if lang == 'mg' else MOIS_FR
        return f"{dt.day} {mois[dt.month]} {dt.year}"
    except Exception:
        return str(dt)

def fmt_heure(dt):
    if dt is None:
        return ""
    try:
        return dt.strftime("%H ora %M minitra")
    except Exception:
        return ""

def fmt_heure_fr(dt):
    if dt is None:
        return ""
    try:
        return dt.strftime("%H heures %M minutes")
    except Exception:
        return ""

def info_personne(p, lang='mg'):
    if not p:
        return "tsy fantatra" if lang == 'mg' else "inconnu(e)"
    if lang == 'mg':
        return (
            f"{p.nom_personne} {p.prenom_personne}, "
            f"teraka ny {fmt_date(p.date_naissance, 'mg')} "
            f"tao {p.lieu_naiss or 'N/A'}, "
            f"asa {p.profession or 'N/A'}"
        )
    else:
        return (
            f"{p.nom_personne} {p.prenom_personne}, "
            f"ne(e) le {fmt_date(p.date_naissance, 'fr')} "
            f"a {p.lieu_naiss or 'N/A'}, "
            f"de profession {p.profession or 'N/A'}"
        )


# Titres bilingues

TITRES_MG = {
    'acte naissance': "Kopian'ny Sora-piankohonana",
    'acte mariage'  : "Kopian'ny Sora-panambadiana",
    'acte deces'    : "Kopian'ny Sora-pahafatesana",
    'acte deces'    : "Kopian'ny Sora-pahafatesana",
}

TITRES_FR = {
    'acte naissance': "Extrait d'acte de naissance",
    'acte mariage'  : "Extrait d'acte de mariage",
    'acte deces'    : "Extrait d'acte de deces",
    'acte deces'    : "Extrait d'acte de deces",
}


# Classe PDF

class ActePDF(FPDF):

    def __init__(self, nom_commune, num_arro, nom_maire, num_acte, personne_principale):
        super().__init__()
        self.nom_commune         = nom_commune
        self.num_arro            = num_arro
        self.nom_maire           = nom_maire
        self.num_acte            = num_acte
        self.personne_principale = personne_principale
        self._current_lang       = 'mg'

    def header(self):
        if os.path.exists(LOGO_PATH):
            self.image(LOGO_PATH, x=16, y=7, w=16)

        self.set_font("Helvetica", "B", 12)
        self.set_y(6)
        self.set_x(35)
        self.cell(155, 6, "REPOBLIKAN'I MADAGASIKARA",
                  align="C", new_x="LMARGIN", new_y="NEXT")

        self.set_font("Helvetica", "", 9)
        self.set_x(35)
        self.cell(155, 5, "Fitiavana - Tanindrazana - Fandrosoana",
                  align="C", new_x="LMARGIN", new_y="NEXT")

        self.set_font("Helvetica", "B", 10)
        self.set_x(35)
        self.cell(155, 5, f"COMMUNE URBAINE DE {self.nom_commune.upper()}",
                  align="C", new_x="LMARGIN", new_y="NEXT")

        if self.num_arro:
            self.set_font("Helvetica", "", 9)
            self.set_x(35)
            self.cell(155, 5, self.num_arro,
                      align="C", new_x="LMARGIN", new_y="NEXT")

        self.set_y(30)
        self.set_line_width(0.5)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(3)

    def footer(self):
        self.set_y(-20)
        self.set_font("Helvetica", "", 7)
        self.set_text_color(100, 100, 100)
        if self._current_lang == 'mg':
            self.cell(0, 5,
                      "AD AMBADIKA NY DIKAN'ITY SORATRA ITY AMIN'NY TENY FRANTSAY",
                      align="C")
        else:
            self.cell(0, 5,
                      "AU VERSO LA VERSION ORIGINALE EN LANGUE MALGACHE",
                      align="C")
        self.set_text_color(0, 0, 0)

    def titre_acte(self, titre, date_acte, num_acte, lang='mg'):
        self.set_font("Helvetica", "BI", 15)
        self.cell(0, 10, titre, align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "", 8)
        self.cell(0, 5,
                  f"Commune Urbaine {self.nom_commune} - {self.num_arro}",
                  align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)
        self.set_font("Helvetica", "", 9)
        self.cell(0, 5, f"N {num_acte} - {fmt_date(date_acte, lang)}",
                  new_x="LMARGIN", new_y="NEXT")
        self.ln(3)

    def paragraphe(self, texte):
        self.set_font("Helvetica", "", 9)
        self.set_x(20)
        self.multi_cell(170, 5, texte, new_x="LMARGIN", new_y="NEXT")
        self.ln(1)

    def separateur(self):
        self.ln(2)
        self.set_line_width(0.2)
        self.line(20, self.get_y(), 190, self.get_y())
        self.ln(3)

    def signature_et_qr(self, num_acte, lang='mg'):
        self.set_auto_page_break(False)
        y_bas = 220

        self.set_xy(20, y_bas)
        self.set_font("Helvetica", "B", 9)
        if lang == 'mg':
            self.cell(0, 5, "Ny Mpiandraikitra ny sora-piankohonana",
                      new_x="LMARGIN", new_y="NEXT")
        else:
            self.cell(0, 5, "L'Officier de l'Etat Civil",
                      new_x="LMARGIN", new_y="NEXT")

        self.set_x(20)
        self.set_font("Helvetica", "", 9)
        self.cell(0, 5, self.nom_maire, new_x="LMARGIN", new_y="NEXT")

        # IMAGE SIGNATURE 
        if os.path.exists(SIGNATURE_PATH):
            self.image(SIGNATURE_PATH, x=20, y=y_bas + 12, w=40, h=20)
        else:
            self.line(20, y_bas + 22, 80, y_bas + 22)
            print(f"[PDF] Signature introuvable : {SIGNATURE_PATH}")

        # QR code
        import tempfile
        try:
            qr_buf  = generer_qr_code(num_acte)
            qr_path = os.path.join(tempfile.gettempdir(),
                                   f"qr_{num_acte.replace('-', '_')}.png")
            with open(qr_path, 'wb') as f:
                f.write(qr_buf.read())
            self.image(qr_path, x=155, y=y_bas - 5, w=30, h=30)
            self.set_xy(150, y_bas + 26)
            self.set_font("Helvetica", "", 7)
            label = "Scan hamafisana" if lang == 'mg' else "Scanner pour verifier"
            self.cell(45, 4, label, align="C")
            os.remove(qr_path)
        except Exception as e:
            print(f"QR error: {e}")

    # Generateur de contenu 

    def generer_contenu(self, type_lb, roles, date_evenement, lieu_evenement,
                        cause_deces, acte, lang='mg'):

        if type_lb == 'acte naissance':
            enfant = roles.get('enfant')
            pere   = roles.get('pere')
            mere   = roles.get('mere')

            if lang == 'mg':
                sexe   = "lahy" if (enfant and enfant.sexe == 'M') else "vavy"
                prenom = enfant.prenom_personne if enfant else "N/A"
                nom    = enfant.nom_personne    if enfant else "N/A"
                self.paragraphe(
                    f"Ny {fmt_date(date_evenement, 'mg')} tamin'ny {fmt_heure(date_evenement)}, "
                    f"tao {lieu_evenement}, Kaominina Urbaine {self.nom_commune}, "
                    f"dia teraka zaza {sexe} atao hoe {prenom} {nom}."
                )
                if pere: self.paragraphe(f"Ray : {info_personne(pere, 'mg')}.")
                if mere: self.paragraphe(f"Reny : {info_personne(mere, 'mg')}.")
            else:
                sexe   = "masculin" if (enfant and enfant.sexe == 'M') else "feminin"
                prenom = enfant.prenom_personne if enfant else "N/A"
                nom    = enfant.nom_personne    if enfant else "N/A"
                self.paragraphe(
                    f"Le {fmt_date(date_evenement, 'fr')} a {fmt_heure_fr(date_evenement)}, "
                    f"a {lieu_evenement}, Commune Urbaine de {self.nom_commune}, "
                    f"est ne(e) un enfant de sexe {sexe} prenomme(e) {prenom} {nom}."
                )
                if pere: self.paragraphe(f"Pere : {info_personne(pere, 'fr')}.")
                if mere: self.paragraphe(f"Mere : {info_personne(mere, 'fr')}.")

        elif type_lb == 'acte mariage':
            epoux1      = roles.get('epoux1')
            epoux2      = roles.get('epoux2')
            pere_epoux1 = roles.get('pere_epoux1')
            mere_epoux1 = roles.get('mere_epoux1')
            pere_epoux2 = roles.get('pere_epoux2')
            mere_epoux2 = roles.get('mere_epoux2')

            if lang == 'mg':
                self.paragraphe(
                    f"Ny {fmt_date(date_evenement, 'mg')} tamin'ny {fmt_heure(date_evenement)}, "
                    f"tao {lieu_evenement}, Kaominina Urbaine {self.nom_commune}, "
                    f"dia natao ny fanambadiana :"
                )
                if epoux1:      self.paragraphe(f"Lahy : {info_personne(epoux1, 'mg')}.")
                if pere_epoux1: self.paragraphe(f"Ray ny lahy : {info_personne(pere_epoux1, 'mg')}.")
                if mere_epoux1: self.paragraphe(f"Reny ny lahy : {info_personne(mere_epoux1, 'mg')}.")
                self.ln(2)
                if epoux2:      self.paragraphe(f"Vavy : {info_personne(epoux2, 'mg')}.")
                if pere_epoux2: self.paragraphe(f"Ray ny vavy : {info_personne(pere_epoux2, 'mg')}.")
                if mere_epoux2: self.paragraphe(f"Reny ny vavy : {info_personne(mere_epoux2, 'mg')}.")
            else:
                self.paragraphe(
                    f"Le {fmt_date(date_evenement, 'fr')} a {fmt_heure_fr(date_evenement)}, "
                    f"a {lieu_evenement}, Commune Urbaine de {self.nom_commune}, "
                    f"ont ete unis par les liens du mariage :"
                )
                if epoux1:      self.paragraphe(f"Epoux : {info_personne(epoux1, 'fr')}.")
                if pere_epoux1: self.paragraphe(f"Pere de l'epoux : {info_personne(pere_epoux1, 'fr')}.")
                if mere_epoux1: self.paragraphe(f"Mere de l'epoux : {info_personne(mere_epoux1, 'fr')}.")
                self.ln(2)
                if epoux2:      self.paragraphe(f"Epouse : {info_personne(epoux2, 'fr')}.")
                if pere_epoux2: self.paragraphe(f"Pere de l'epouse : {info_personne(pere_epoux2, 'fr')}.")
                if mere_epoux2: self.paragraphe(f"Mere de l'epouse : {info_personne(mere_epoux2, 'fr')}.")

        else:  # deces
            defunt      = roles.get('defunt')
            pere_defunt = roles.get('pere_defunt')
            mere_defunt = roles.get('mere_defunt')

            if lang == 'mg':
                self.paragraphe(
                    f"Ny {fmt_date(date_evenement, 'mg')} tamin'ny {fmt_heure(date_evenement)}, "
                    f"tao {lieu_evenement}, dia maty : {info_personne(defunt, 'mg')}."
                )
                if cause_deces:
                    self.paragraphe(f"Antony nahafatesana : {cause_deces}.")
                if pere_defunt: self.paragraphe(f"Ray : {info_personne(pere_defunt, 'mg')}.")
                if mere_defunt: self.paragraphe(f"Reny : {info_personne(mere_defunt, 'mg')}.")
            else:
                self.paragraphe(
                    f"Le {fmt_date(date_evenement, 'fr')} a {fmt_heure_fr(date_evenement)}, "
                    f"a {lieu_evenement}, est decede(e) : {info_personne(defunt, 'fr')}."
                )
                if cause_deces:
                    self.paragraphe(f"Cause du deces : {cause_deces}.")
                if pere_defunt: self.paragraphe(f"Pere : {info_personne(pere_defunt, 'fr')}.")
                if mere_defunt: self.paragraphe(f"Mere : {info_personne(mere_defunt, 'fr')}.")

        # Temoin et constat
        self.separateur()
        temoin  = roles.get('temoin')
        temoin2 = roles.get('temoin2')

        if lang == 'mg':
            self.paragraphe(
                f"Ambara tamin'ny {fmt_date(acte.date_acte, 'mg')} "
                f"nataon'ny {info_personne(temoin, 'mg')}."
            )
            if temoin2:
                self.paragraphe(f"Vavolombelona faharoa : {info_personne(temoin2, 'mg')}.")
            self.ln(3)
            self.paragraphe(
                f"Izay miara manao sonia aminay {self.nom_maire}, Mpiandraikitra ny Sora-piankohonana "
                f"ny Kaominina Urbaine {self.nom_commune}, "
                f"sonian'izahay etsy ambany."
            )
        else:
            self.paragraphe(
                f"Declare le {fmt_date(acte.date_acte, 'fr')} "
                f"par {info_personne(temoin, 'fr')}."
            )
            if temoin2:
                self.paragraphe(f"Second temoin : {info_personne(temoin2, 'fr')}.")
            self.ln(3)
            self.paragraphe(
                f"Constate avec nous {self.nom_maire}, Officier de l'Etat Civil "
                f"de la Commune Urbaine de {self.nom_commune}, en signant ci-dessous."
            )


# Generateur principal

def generer_pdf_acte(num_acte, id_demande=None):
    # 1. Acte
    acte    = Acte.objects.select_related('type_acte').get(num_acte=num_acte)
    type_lb = acte.type_acte.libelle.lower()

    # 2. Personnes
    roles = {
        ap.role: ap.id_personne
        for ap in ActePersonne.objects.select_related('id_personne').filter(
            id_acte=acte.id_acte
        )
    }

    # 3. Commune / maire
    nom_commune = "Antananarivo"
    nom_maire   = "L'Officier de l'Etat Civil"
    num_arro    = ""

    if id_demande:
        try:
            demande = Demande.objects.select_related(
                'id_commune', 'id_arrondissement'
            ).get(id_demande=id_demande)
            if demande.id_commune:
                nom_commune = demande.id_commune.nom_commune
                nom_maire   = demande.id_commune.nom_maire or nom_maire
            if demande.id_arrondissement:
                num_arro = f"Boriborintany faha {demande.id_arrondissement.num_arondissement}"
        except Demande.DoesNotExist:
            pass

    # 4. Infos evenement
    date_evenement = None
    lieu_evenement = nom_commune
    cause_deces    = ""

    if type_lb == 'acte naissance':
        enfant = roles.get('enfant')
        if enfant and enfant.date_naissance:
            date_evenement = enfant.date_naissance
            lieu_evenement = enfant.lieu_naiss or nom_commune

    elif type_lb == 'acte mariage':
        try:
            am             = ActeMariage.objects.get(id_acte=acte)
            date_evenement = am.date_mariage
            lieu_evenement = am.lieu_mariage or nom_commune
        except ActeMariage.DoesNotExist:
            pass

    elif type_lb in ('acte deces', 'acte deces') or 'deces' in type_lb:
        try:
            ad             = ActeDeces.objects.get(id_acte=acte)
            date_evenement = ad.date_deces
            lieu_evenement = ad.lieu_deces or nom_commune
            cause_deces    = ad.cause_deces or ""
        except ActeDeces.DoesNotExist:
            pass

    # 5. Personne principale
    pp = roles.get('enfant') or roles.get('epoux1') or roles.get('defunt')
    personne_principale = f"{pp.nom_personne} {pp.prenom_personne}" if pp else ""

    # Debug chemins
    print(f"[PDF] LOGO      : {LOGO_PATH} — existe: {os.path.exists(LOGO_PATH)}")
    print(f"[PDF] SIGNATURE : {SIGNATURE_PATH} — existe: {os.path.exists(SIGNATURE_PATH)}")

    # 6. Creer le PDF
    pdf = ActePDF(nom_commune, num_arro, nom_maire, num_acte, personne_principale)
    pdf.set_left_margin(20)
    pdf.set_right_margin(10)

    #  PAGE 1 : MALGACHE 
    pdf._current_lang = 'mg'
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=50)
    titre_mg = TITRES_MG.get(type_lb, acte.type_acte.libelle)
    pdf.titre_acte(titre_mg, acte.date_acte, num_acte, lang='mg')
    pdf.generer_contenu(type_lb, roles, date_evenement, lieu_evenement,
                        cause_deces, acte, lang='mg')
    pdf.signature_et_qr(num_acte, lang='mg')

    #  PAGE 2 : FRANCAIS 
    pdf._current_lang = 'fr'
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=50)
    titre_fr = TITRES_FR.get(type_lb, acte.type_acte.libelle)
    pdf.titre_acte(titre_fr, acte.date_acte, num_acte, lang='fr')
    pdf.generer_contenu(type_lb, roles, date_evenement, lieu_evenement,
                        cause_deces, acte, lang='fr')
    pdf.signature_et_qr(num_acte, lang='fr')

    buffer = io.BytesIO(pdf.output())
    buffer.seek(0)
    return buffer