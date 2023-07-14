export class Chromosom {
    public fitness: number;
    
    setFitness(fitness: number) {
        this.fitness = fitness;
    }
    constructor(
                public gerichte: number[],
                ) 
    {
        this.gerichte = gerichte;
    }
}
 
