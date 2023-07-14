
export class Gericht {
    foodNutrients: any;
    constructor(
                public description: String,
                public protein: number,
                public fett: number,
                public karb: number,
                public kalorien: number,
                ) 
    {
        this.description = description;
        this.protein = protein;
        this.karb = karb;
        this.fett = fett;
        this.kalorien = kalorien;
    }
}

