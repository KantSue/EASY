# apps/dashboard_app/services/heapqm.py

class MinHeap:

    def __init__(self):
        self.heap = []

    # Helpers

    def taille(self):
        return len(self.heap)

    def est_vide(self):
        return self.taille() == 0

    def peek(self):
        return self.heap[0] if not self.est_vide() else None

    def _echanger(self, i, j):
        self.heap[i], self.heap[j] = self.heap[j], self.heap[i]

    def _parent(self, i):
        return (i - 1) // 2

    def _gauche(self, i):
        return 2 * i + 1

    def _droite(self, i):
        return 2 * i + 2

    # Montée 

    def _monter(self, i):
        while i > 0:
            p = self._parent(i)
            if self.heap[i] < self.heap[p]:
                self._echanger(i, p)
                i = p
            else:
                break

    #  Descente

    def _descendre(self, i):
        n = self.taille()
        while True:
            plus_petit = i
            g = self._gauche(i)
            d = self._droite(i)

            if g < n and self.heap[g] < self.heap[plus_petit]:
                plus_petit = g
            if d < n and self.heap[d] < self.heap[plus_petit]:
                plus_petit = d

            if plus_petit != i:
                self._echanger(i, plus_petit)
                i = plus_petit
            else:
                break

    # publique 

    def push(self, item):
        self.heap.append(item)
        self._monter(self.taille() - 1)

    def pop(self):
      
        if self.est_vide():
            return None
        if self.taille() == 1:
            return self.heap.pop()

        self._echanger(0, self.taille() - 1)
        minimum = self.heap.pop()
        self._descendre(0)
        return minimum

    def construire(self, items):
       
        self.heap = list(items)
        for i in range(self.taille() // 2 - 1, -1, -1):
            self._descendre(i)

    def vers_liste_triee(self):
       
        sauvegarde = self.heap[:]
        resultat = []
        while not self.est_vide():
            resultat.append(self.pop())
        self.heap = sauvegarde
        return resultat