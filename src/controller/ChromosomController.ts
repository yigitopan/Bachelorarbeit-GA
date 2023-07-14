import fs from 'fs'
import { erstellenOderAktualiserenGerichteJson } from "../controller/DateiController";
import { Chromosom } from "../models/Chromosom";
import { Gericht } from "../models/Gericht";
import { lebensmittelliste } from '../controller/DateiController';
require('dotenv').config()


export class ChromosomController {
    private mean: number;
    private elite: Chromosom;
    private gerichte: Gericht[];
    private laengeDerChromosomen: number;
    private dieBeste: Chromosom[] = [];
    private fitnessDerBesten: number[] = []
    private results: number[] = []
    private means: number[] = []
    constructor(
        public LBM: number, // Bekommen wir LBM und Kalorien in der Konstruktor, um diese Werte in den Funktionen zu nutzen
        public taeglicheKalorien: number,
        ){
            this.LBM = LBM,
            this.taeglicheKalorien = taeglicheKalorien
        }
        
    private populationInitialisieren = (anzahlDerIndividuellen: number) => {
        let neuePopulation: Chromosom[] = [];
        this.gerichte = lebensmittelliste(); 
        
        // Speichern es als LDC, damit wir es nach der for-Schleife wieder auf laengeDesChromosoms stellen.
        for (let index = 0; index < anzahlDerIndividuellen; index++) { 

            this.laengeDerChromosomen = this.gerichte.length
            let ldcTemp = this.laengeDerChromosomen;
            let individuell = new Array(this.laengeDerChromosomen).fill(0)

            const mengen: number[] = [];
            const zufaelligeGerichte: Gericht[] = [];
                                  // Anzahl der Gerichte in JSON
            // Es gibt 5328 Gerichte in JSON. 
            // Mit dieser While LDC beginnt mit dem Wert 5327.
            while (ldcTemp--) {
                var x = Math.random();   // Zufällige Nummer Zwischen 0 und "laenge"

                if(x<0.5) {
                    individuell[index] = 1;
                }
            }

            let chromosom: Chromosom = new Chromosom(individuell)
            neuePopulation.push(chromosom);
        }
        let bestesChromosom = neuePopulation.reduce((min, bCh) => min.fitness > bCh.fitness ? min : bCh);
        this.elite = bestesChromosom;

        return neuePopulation;
    }
    
    private fitnessEvaluation = (chromosom: Chromosom): number => {
        let gesamtProtein: number = 0;
        let gesamtFett: number = 0;
        let gesamtKohlenhydrat: number = 0;
      
        // Für jedes Gericht 
        
        var len = chromosom.gerichte.length;

        while(len--){
            if(chromosom.gerichte[len] == 1) {
                const gericht = this.gerichte[len];
                gesamtProtein += gericht.protein
                gesamtFett += gericht.fett
                gesamtKohlenhydrat += gericht.karb
            }
        }

        // Gesamte Kalorien von Fett und Protein (Damit wir die restliche auf Kohlenhydrat verteilen können.)
        const proteinKalorien = gesamtProtein * 4;
        const fettKalorien = gesamtFett * 9;
      
        // Gesamte Kalorien von Kohlenhydraten
        const kohlenhydratKalorien = gesamtKohlenhydrat * 4;
    
        // Gesamte Kalorien für alle Zutaten
        const gesamtKalorien = kohlenhydratKalorien + proteinKalorien + fettKalorien;
      
        /* 
        
        //Fitness-Funktion zur Protein-Maximierung

        let gesamtFitness = proteinKalorien/(this.taeglicheKalorien);

        if(gesamtKalorien>this.taeglicheKalorien || gesamtProtein == 0 || gesamtFitness > 1) {
            gesamtFitness = 0;
        }

        */

        //Ziele, die bei der Studie überrichtet wurden - Basiert auf LBM
        const zielProtein = this.LBM * 2.5
        const zielFett = this.LBM * 0.75;
      
        // SSE
        const proteinUnterschied = gesamtProtein - zielProtein;
        const fettUnterschied = gesamtFett - zielFett;
        const kalorienUnterschied = gesamtKalorien - this.taeglicheKalorien;
      
        const proteinFitness = proteinUnterschied ** 2;
        const fettFitness = fettUnterschied ** 2;
        const kalorienFitness = kalorienUnterschied ** 2;
    
        let gesamtFitness = (proteinFitness + fettFitness + kalorienFitness);

        if(gesamtKalorien>this.taeglicheKalorien) {
            gesamtFitness = gesamtFitness + 5000;
        }
        
        chromosom.setFitness(gesamtFitness);
    
        return gesamtFitness;
    }

    private tournamentSelektion(population: Chromosom[], tournamentGroesse: number) {
        let index= 0;

        const eltern: Chromosom[] = [];
        let anzahlDerTournaments = population.length / tournamentGroesse; // Jedes Tournament hat einen Gewinner
        while (anzahlDerTournaments > 0) {
            let tournament: Chromosom[] = []

            for (let i = 0; i < tournamentGroesse; i++) {   // Hol Chromosomen zufällig genug, um die tournamentGroesse zu erreichen
                tournament.push(population[index]);
                index++;
            }

            const fittesten = tournament.reduce(function(prev, current) {
                return (prev.fitness > current.fitness) ? prev : current  // Survival of the Fittest
            })

            eltern.push(fittesten);                                      // Der Fitteste wird eine Eltern
            anzahlDerTournaments--;
        }

        return eltern;
    }

    private crossover(parents: Chromosom[]) {
        parents.sort(() => 0.5 - Math.random()); // NICHT SICHER

        const kinder: Chromosom[] = [];
        const crossoverPunkt =  Math.floor(Math.random() * this.laengeDerChromosomen)
        //Diese Funktion ist selbstverständlich
        var pL = parents.length - 1;
 

        while(pL--) {
            // Jedes Chromosom wird 2 mal benutzt, außer der Erste(1) und Letzte(1). Wir benutzen diese zwei um es zu kompansieren
            if(pL==0){
                const random = Math.random();
                if(random<Number(process.env.CROSSOVER_RATE)) {
                    
                    const g_ersteE_ersteH: number[] = parents[pL].gerichte.slice(0,crossoverPunkt)
                    const g_ersteE_zweiteH: number[] = parents[pL].gerichte.slice(crossoverPunkt, this.laengeDerChromosomen)
        
                    const g_zweiteE_ersteH: number[] = parents[parents.length-1].gerichte.slice(0,crossoverPunkt)
                    const g_zweiteE_zweiteH: number[] = parents[parents.length-1].gerichte.slice(crossoverPunkt,this.laengeDerChromosomen)

                    let kind1 = new Chromosom(g_ersteE_ersteH.concat(g_zweiteE_zweiteH))
                    let kind2 = new Chromosom(g_ersteE_zweiteH.concat(g_zweiteE_ersteH))
        
                    kinder.push(kind1)
                    kinder.push(kind2)
                }
                else {
                    kinder.push(parents[pL])
                    kinder.push(parents[parents.length-1])
                }
            } 
            const random = Math.random();
            if(random<Number(process.env.CROSSOVER_RATE)) {
                const g_ersteE_ersteH: number[] = parents[pL].gerichte.slice(0,crossoverPunkt)
                const g_ersteE_zweiteH: number[] = parents[pL].gerichte.slice(crossoverPunkt, this.laengeDerChromosomen)
    
                const g_zweiteE_ersteH: number[] = parents[parents.length-1].gerichte.slice(0,crossoverPunkt)
                const g_zweiteE_zweiteH: number[] = parents[parents.length-1].gerichte.slice(crossoverPunkt,this.laengeDerChromosomen)
    
                let kind1 = new Chromosom(g_ersteE_ersteH.concat(g_zweiteE_zweiteH))
                let kind2 = new Chromosom(g_ersteE_zweiteH.concat(g_zweiteE_ersteH))

                kinder.push(kind1)
                kinder.push(kind2)
            }
            else {
                kinder.push(parents[pL])
                kinder.push(parents[pL+1])
            }
        }
        
        return kinder;
    }

    private mutation(chromosomen: Chromosom[]) {
        chromosomen.forEach(chromosom => {
            if(chromosom != this.elite) {
                let mutationGericht = Math.random();
                if(mutationGericht < Number(process.env.MUTATION_RATE)) {
                        let x = Math.floor(Math.random()*this.laengeDerChromosomen)
                        for (let i = x; i < this.laengeDerChromosomen; i++) {
                            if(chromosom.gerichte[i] != 0) {
                                chromosom.gerichte[i] = 0;
                                break;
                            }
                        }
                        //chromosom.gerichte[Math.floor(Math.random() * this.laengeDerChromosomen)] = parseFloat((Math.random() * (3 - 1) + 1).toFixed(2))
                        chromosom.gerichte[Math.floor(Math.random() * this.laengeDerChromosomen)] = 1
                }
            }
            this.fitnessEvaluation(chromosom);
        });
    }

    private elitism(chromosomen: Chromosom[]) {
        const bestIndex = chromosomen.reduce((accumulator, current, index) => {
            return current.fitness > chromosomen[accumulator].fitness ? index : accumulator;
          }, 0);

          let bestesChromosom = chromosomen[bestIndex];

          const worstIndex = chromosomen.reduce((accumulator, current, index) => {
            return current.fitness < chromosomen[accumulator].fitness ? index : accumulator;
          }, 0);
          
       
        if(bestesChromosom.fitness>this.elite.fitness) {
            this.fitnessDerBesten.push(bestesChromosom.fitness)
            this.dieBeste.push(bestesChromosom)
            this.elite = bestesChromosom;
        }
        else {
            this.fitnessDerBesten.push(this.elite.fitness)
        }
        if(this.elite.fitness>chromosomen[worstIndex].fitness && process.env.ELITISM === 'true') {
            chromosomen[worstIndex] = this.elite
        }
        if(true) {
            
            let sum = 0;
            for(let i = 0; i < chromosomen.length; i++) {
                sum += chromosomen[i].fitness;
            }
    
            this.mean = sum / chromosomen.length;

            this.means.push(this.mean)
            this.results.push(this.elite.fitness)
        }

        const bestIndex2 = chromosomen.reduce((accumulator, current, index) => {
            return current.fitness > chromosomen[accumulator].fitness ? index : accumulator;
          }, 0);
    }

    ergebnis(){
        try {
            const resultat = this.dieBeste.reduce(function(prev, current) {
                return (prev.fitness > current.fitness) ? prev : current  // Survival of the Fittest
            })
    
            let gesamtProtein: number = 0;
            let gesamtFett: number = 0;
            let gesamtKohlenhydrat: number = 0;
          
            // Für jedes Gericht 
            resultat.gerichte.forEach((gen,i) => {
                if(gen>0) {
                    const gericht = this.gerichte[i];
                    gesamtProtein += gericht.protein * gen
                    console.log(gericht)
                    gesamtFett += gericht.fett *gen
                    gesamtKohlenhydrat += gericht.karb *gen
                }
            }); 
            console.log("Fitness:"+resultat.fitness);
            console.log("Protein:"+gesamtProtein);
            console.log("Fett:"+gesamtFett);
            console.log("Kohl.:"+gesamtKohlenhydrat);
            console.log("Kalorien:"+(gesamtFett*9+gesamtKohlenhydrat*4+gesamtProtein*4));
            console.log(resultat.gerichte)

            const final = []
            final.push(resultat, gesamtProtein, gesamtFett, gesamtKohlenhydrat, (gesamtFett*9+gesamtKohlenhydrat*4+gesamtProtein*4))
    
            // Gesamte Kalorien für alle Zutaten
            return resultat;

        } catch (error) {
            throw error
            console.log("Hier ist nicht lebendig..")
        }
    }

    getResultate() {
        const response = [this.results, this.means, this.elite, this.fitnessDerBesten ]
        return response
    }

    lebenUndLebenLassen(anzahlDerIndividuellen: number, anzahlDerPopulation: number) {
        let neuePopulation: Chromosom[] = this.populationInitialisieren(anzahlDerIndividuellen);

        console.log("---- INITIALISERUNG----")
        neuePopulation.forEach((individuell: Chromosom)=> { // Bestimmung der Fitness-Punkten der Neuinitialisierten
            this.fitnessEvaluation(individuell);
        })

        for (let population = 0; population < anzahlDerPopulation; population++) {
            neuePopulation = this.tournamentSelektion(neuePopulation, 2);
            neuePopulation = this.crossover(neuePopulation);

            this.mutation(neuePopulation);
            this.elitism(neuePopulation);


        }
    }
}

    






