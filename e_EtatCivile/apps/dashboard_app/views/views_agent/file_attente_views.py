# apps/dashboard_app/views/file_attente_views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from apps.dashboard_app.models import Demande
from apps.accounts_app.services import verify_jwt
from apps.dashboard_app.services.heapqm import MinHeap


class FileAttenteView(APIView):

    def get(self, request):
        token = (
            request.COOKIES.get('token')
            or request.headers.get('Authorization', '').replace('Bearer ', '')
        )
        payload = verify_jwt(token) if token else None

        if not payload:
            return Response({"error": "Non authentifié"}, status=401)

        id_commune       = payload.get('id_commune')
        id_arondissement = payload.get('id_arondissement')
        role             = payload.get('role')

        print("PAYLOAD AGENT:", payload)

        try:
            if id_commune == 1:
                demandes_qs = Demande.objects.filter(
                    statut_demande='EN ATTENTE',
                    id_arrondissement=id_arondissement
                ).select_related(
                    'id_type_acte', 'id_commune', 'id_arrondissement', 'id_citoyen'
                )
            else:
                demandes_qs = Demande.objects.filter(
                    statut_demande='EN ATTENTE',
                    id_commune=id_commune
                ).select_related(
                    'id_type_acte', 'id_commune', 'id_arrondissement', 'id_citoyen'
                )
        except Exception as e:
            return Response({"error": f"Erreur BDD : {str(e)}"}, status=500)

        print("DEMANDES TROUVEES:", demandes_qs.count())

        items = [
            (d.date_depot, d.id_demande, d)
            for d in demandes_qs
        ]

        tas = MinHeap()
        tas.construire(items)   

        demandes_triees = []
        while not tas.est_vide():
            date_depot, id_demande, demande = tas.pop()
            demandes_triees.append(demande)

        data = []
        for rang, d in enumerate(demandes_triees, start=1):
            data.append({
                "rang"          : rang,
                "traitable"     : rang == 1,

                "id_demande"    : d.id_demande,
                "num_demande"   : d.num_demande,
                "statut_demande": d.statut_demande,
                "type_acte"     : d.id_type_acte.libelle    if d.id_type_acte    else "N/A",
                "commune"       : d.id_commune.nom_commune  if d.id_commune      else "N/A",
                "arrondissement": (
                    d.id_arrondissement.nom_arondissement
                    if d.id_arrondissement else None
                ),
                "date_depot"    : str(d.date_depot),
                "citoyen"       : (
                    f"{d.id_citoyen.nom_user} {d.id_citoyen.prenom_user}"
                    if d.id_citoyen else "N/A"
                ),
            })

        return Response(data, status=200)