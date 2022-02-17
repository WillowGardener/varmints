let width = document.getElementById("layer1").width;
let height = document.getElementById("layer1").height;
const title = document.getElementById("title")
const ctx = document.getElementById("layer1").getContext("2d");
const cnv = document.getElementById("layer1");

let running = false
let resultsRead = false
let predList = []
let preyList = []
let grassList = []
let yearCount = 0
let maintenance = null

let grassStartNumber = 200
let grassSpawnRate = 200
let grassEnergyMin = 20
let grassEnergyMax = 30
let grassGerminationDistance = 50
let grassSpawnThreshold = 3
let grassReach = 50

let preyStartNumber = 32
let preyMaxAge = 8
let preyEnergyMin = 30
let preyEnergyMax = 30
let preySpeedMin = 3
let preySpeedMax = 4
let preyAwarenessMin = 30
let preyAwarenessMax = 40
let preyGreedMin = 50
let preyGreedMax = 70
let preyLibidoMin = 30
let preyLibidoMax = 40
let preyGestation = 3000
let preyLitterMin = 1
let preyLitterMax = 3
let preyInvestmentMin = .25
let preyInvestmentMax = .5
let preySenseEfficiency = 30
let preySpeedEfficiency = 3

let predatorStartNumber = 6
let predatorMaxAge = 12
let predatorEnergyMin = 40
let predatorEnergyMax = 40
let predatorSpeedMin = 4
let predatorSpeedMax = 5
let predatorAwarenessMin = 30
let predatorAwarenessMax = 40
let predatorGreedMin = 50
let predatorGreedMax = 70
let predatorLibidoMin = 30
let predatorLibidoMax = 40
let predatorGestation = 6000
let predatorLitterMin = 1
let predatorLitterMax = 3
let predatorInvestmentMin = .25
let predatorInvestmentMax = .5
let predatorSenseEfficiency = 30
let predatorSpeedEfficiency = 3

let begin = document.getElementById('begin-simulation')
let halt = document.getElementById('halt-simulation')

let questionList = document.getElementsByClassName('question')
for (question of questionList) {
    question.addEventListener('click', function(){
        this.nextSibling.nextSibling.classList.toggle('show')
    })
}

let closeList = document.getElementsByClassName('close')
for (closeX of closeList) {
    closeX.addEventListener('click', function() {
        
        this.parentElement.classList.toggle('show')
    })
    
}

begin.addEventListener("click", function() {
    if (running === false) {

        gameDescription= document.getElementById('game-description')
        gameDescription.style.visibility = 'hidden'
              
        running = true
        startup()
        window.requestAnimationFrame(main_loop);
    }
})

halt.addEventListener("click", function() {
    running = false
    predList = []
    preyList = []
    grassList = []
    ctx.clearRect(0,0,width,height)
    clearInterval(maintenance)
    gameDescription= document.getElementById('game-description')
    gameDescription.style.visibility = 'visible'
    
})

class Grass {
    constructor(){
        this.x = Math.round(Math.random()*width)
        this.y = Math.round(Math.random()*height)
        this.germinationDistance = grassGerminationDistance
        this.spawnThreshold = grassSpawnThreshold
        this.reach = grassReach
        this.maxDensity = this.germinationDistance/7
        let grassImage = document.createElement('img')
        grassImage.src = "grass.png"
        this.img = grassImage
        this.energy = grassEnergyMin + Math.random()*(grassEnergyMax-grassEnergyMin)
    }
    checkProximity(target) {
        let distance_x = Math.abs(this.x-target.x)
        let distance_y = Math.abs(this.y-target.y)
        let distance = Math.sqrt(distance_x*distance_x+distance_y*distance_y)
        return distance
    }
    seed(speciesList) {
        
        let mateCount = 0
        speciesList.forEach((grass,i) => {
            let distance = this.checkProximity(grass)
            if (distance <= this.germinationDistance) {
                mateCount+=1
            }
        })
        let mateRoll = mateCount * Math.random()
        
        if (mateRoll > this.spawnThreshold && mateCount <= this.maxDensity) {
            let baby = new Grass()
            baby.x = this.x + (Math.random()-.5)*2*this.reach
            baby.y = this.y + (Math.random()-.5)*2*this.reach
            if (baby.x < 10) {
                baby.x = 10
            }
            else if (baby.x > width-10) {
                baby.x = width- 10
            }
            if (baby.y < 10) {
                baby.y = 10
            }
            else if (baby.y > height-10) {
                baby.y = height- 10
            }
            speciesList.push(baby)
        }
        

        
    }
}



class Animal {
    constructor(){
        this.age = 0
        this.maxAge = 8
        this.energy = 20
        const sexList = ["female", "male"]
        this.sex = sexList[Math.round(Math.random())]
        this.pregnant = false
        this.x = Math.round(Math.random()*width)
        this.y = Math.round(Math.random()*height)
        this.awareness = 30
        this.speed = 3
        this.size = 16
        this.x_move = this.speed
        this.y_move = this.speed
        this.gestation = 3000
        this.minLitterSize = 1
        this.maxLitterSize = 3
        
        this.metabolism = this.speed/8 + this.awareness/80
        this.greed = 50 + Math.random() *50
        this.libido = 35
        this.parentalInvestment = Math.random()/2
        
        this.getOlder()
        this.getHungry()
    }
    getOlder() {setInterval(()=>{
        this.age+=1
        if (this.age >= this.maxAge) {
            // this.speed = 0
            // this.x_move = 0
            // this.y_move = 0
            // this.awareness = 0
            // this.energy = 0
            
            this.sex = "corpse"
        }
        
    },12000)
    }
    getHungry() { setInterval( ()=> {
        this.energy -= this.metabolism
    },200)
    }

    checkProximity(target) {
        let distance_x = Math.abs(this.x-target.x)
        let distance_y = Math.abs(this.y-target.y)
        let distance = Math.sqrt(distance_x*distance_x+distance_y*distance_y)
        return distance
    }
    checkAdjacent(target) {
        let distance = this.checkProximity(target)
        if (distance < this.size) {
            return true
        }
    }
    
    
    eat(target_array){
        
        target_array.forEach((target,i) => {
            if (this.sex != 'corpse') {
                let proximity = this.checkProximity(target)
                let edible = this.checkAdjacent(target)
                if (edible === true) {
                    this.energy += target.energy
                    target.energy = 0
                    target_array.splice(i,1)
                    
                }
                else if (proximity <= this.awareness) {
                    this.moveToward(target)
                }
            }
        })
    }
    move() {
        this.x += this.x_move
        this.y += this.y_move
        if (this.x > width) {
            this.x_move*=-1
            this.x = width
        }
        if (this.x < 0) {
            this.x_move*=-1
            this.x = 0
        }
        if (this.y > height) {
            this.y_move*=-1
            this.y = height
        } 
        if (this.y < 0) {
            this.y_move*=-1
            this.y = 0
        }

    }
    moveToward(target) {
        if (this.x >= target.x) {
            this.x_move = -1*this.speed
        }
        else if (this.x <= target.x) {
            this.x_move = this.speed
        }
        if (this.y >= target.y) {
            this.y_move = -1*this.speed
        }
        else if (this.y <= target.y) {
            this.y_move = this.speed
        }
    }
    moveAway(target) {
        if (this.x >=  target.x) {
            this.x_move = this.speed
        }
        else if (this.x <= target.x) {
            this.x_move = -1 * this.speed
        }
        if (this.y >= target.y) {
            this.y_move = this.speed
        }
        else if (this.y <= target.y) {
            this.y_move = -1 * this.speed
        }
    }
    
    
    
    
}

class Prey extends Animal {
    constructor(){
        super()
        let preyImage = document.createElement('img')
        preyImage.src = "rabbit.png"
        this.img = preyImage

        this.energy = preyEnergyMin + Math.random()*(preyEnergyMax-preyEnergyMin)
        this.speed = preySpeedMin + Math.random()*(preySpeedMax-preySpeedMin)
        this.awareness = preyAwarenessMin + Math.random()*(preyAwarenessMax-preyAwarenessMin)
        this.maxAge = preyMaxAge
        this.greed = preyGreedMin + Math.random()*(preyGreedMax-preyGreedMin)
        this.libido = preyLibidoMin + Math.random()*(preyLibidoMax-preyLibidoMin)
        this.gestation = preyGestation
        this.metabolism = this.speed/preySpeedEfficiency + this.awareness/preySenseEfficiency
        this.minLitterSize = preyLitterMin
        this.maxLitterSize = preyLitterMax
        this.parentalInvestment = preyInvestmentMin + Math.random()*(preyInvestmentMax-preyInvestmentMin)
    }
    mate = (thisList) => {
        
        if (this.sex === 'female' && this.age >= 1 && this.pregnant === false && this.energy >= this.libido) {
            thisList.forEach((boy,i) => {
                let mateable = this.checkProximity(boy)
                if (mateable <= this.awareness && this.pregnant === false && boy.energy >= boy.libido && boy.sex === 'male' && boy.age >= 1) { 
                    this.pregnant = true
                    boy.energy -= boy.energy * boy.parentalInvestment
                    //Causes the prey to give birth after 3 seconds
                    this.pregnancy = setTimeout(() => {
                        let childSupport = this.parentalInvestment * this.energy
                        this.energy -= childSupport
                        let litterSize = Math.round(this.minLitterSize + Math.random()*(this.maxLitterSize-this.minLitterSize))
                        for (let i=0;i<litterSize;i++) {
                            let child = new Prey()
                            child.energy = childSupport/litterSize
                            child.x = this.x
                            child.y = this.y

                            child.speed = (Math.random()/2+.75) * this.speed
                            child.awareness = (Math.random()/2+.75) * this.awareness
                            child.greed = (Math.random()/2+.75) * this.greed
                            child.libido = (Math.random()/2+.75) * this.libido
                            child.parentalInvestment = (Math.random()/2+.75) * this.parentalInvestment
                            if (child.parentalInvestment > 1) {child.parentalInvestment = 1}
                            
                            thisList.push(child)
                            
                        }
                        this.pregnant = false
                        
                    },this.gestation)
                }
            })
        }
    }
}

class Predator extends Animal {
    constructor(){
        super()
        this.energy = predatorEnergyMin + Math.random()*(predatorEnergyMax-predatorEnergyMin)
        this.maxAge = predatorMaxAge
        this.speed = predatorSpeedMin + Math.random()*(predatorSpeedMax-predatorSpeedMin)
        this.awareness = predatorAwarenessMin + Math.random()*(predatorAwarenessMax-predatorAwarenessMin)
        this.greed = predatorGreedMin + Math.random()*(predatorGreedMax-predatorGreedMin)
        this.libido = predatorLibidoMin + Math.random()*(predatorLibidoMax-predatorLibidoMin)
        this.gestation = predatorGestation
        this.minLitterSize = predatorLitterMin
        this.maxLitterSize = predatorLitterMax
        this.parentalInvestment = predatorInvestmentMin + Math.random()*(predatorInvestmentMax-predatorInvestmentMin)
        this.metabolism = this.speed/predatorSpeedEfficiency + this.awareness/predatorSenseEfficiency
        let predImage = document.createElement('img')
        predImage.src = "fox.png"
        this.img = predImage
    }
    mate = (thisList) => {
        
        if (this.sex === 'female' && this.age >= 1 && this.pregnant === false && this.energy >= this.libido) {
            thisList.forEach((boy,i) => {
                let mateable = this.checkProximity(boy)
                if (mateable <= this.awareness && this.pregnant === false && boy.energy >= boy.libido && boy.age >= 2) { 
                    this.pregnant = true
                    boy.energy -= boy.energy * boy.parentalInvestment
                    //Causes the prey to give birth after 3 seconds
                    this.pregnancy = setTimeout(() => {
                        let childSupport = this.parentalInvestment * this.energy
                        this.energy -= childSupport
                        let litterSize = Math.round(this.minLitterSize + Math.random()*(this.maxLitterSize-this.minLitterSize))
                        for (let i=0;i<litterSize;i++) {
                            let child = new Predator()
                            child.energy = childSupport/litterSize
                            child.x = this.x
                            child.y = this.y

                            child.speed = (Math.random()/2+.75) * this.speed
                            child.awareness = (Math.random()/2+.75) * this.awareness
                            child.greed = (Math.random()/2+.75) * this.greed
                            child.libido = (Math.random()/2+.75) * this.libido
                            child.parentalInvestment = (Math.random()/2+.75) * this.parentalInvestment
                            if (child.parentalInvestment > 1) {child.parentalInvestment = 1}

                            thisList.push(child)
                            
                        }
                        this.pregnant = false
                        
                    },this.gestation)
                }
            })
        }
    }
}

function startup() {
    grassEnergyMin = parseFloat(document.getElementById("grass-energy-min").value)
    grassEnergyMax = parseFloat(document.getElementById("grass-energy-max").value)
    // grassSpawnRate = 1000/parseInt(document.getElementById('grass-spawn-rate').value)
    grassGerminationDistance = parseFloat(document.getElementById("grass-germination-distance").value)
    grassSpawnThreshold = parseFloat(document.getElementById("grass-spawn-threshold").value)
    grassReach = parseFloat(document.getElementById("grass-reach").value)
    
    preyStartNumber = parseInt(document.getElementById('prey-start-number').value)
    preyMaxAge = parseInt(document.getElementById('prey-max-age').value)
    preyEnergyMin = parseFloat(document.getElementById('prey-energy-min').value)
    preyEnergyMax = parseFloat(document.getElementById('prey-energy-max').value)
    preySpeedMin = parseFloat(document.getElementById('prey-speed-min').value)
    preySpeedMax = parseFloat(document.getElementById('prey-speed-max').value)
    preyAwarenessMin = parseFloat(document.getElementById('prey-awareness-min').value)
    preyAwarenessMax = parseFloat(document.getElementById('prey-awareness-max').value)
    preyGreedMin = parseFloat(document.getElementById('prey-greed-min').value)
    preyGreedMax = parseFloat(document.getElementById('prey-greed-max').value)
    preyLibidoMin = parseFloat(document.getElementById('prey-libido-min').value)
    preyLibidoMax = parseFloat(document.getElementById('prey-libido-max').value)
    preyGestation = parseInt(document.getElementById('prey-gestation-length').value)*1000
    preyLitterMin = parseInt(document.getElementById('prey-litter-min').value)
    preyLitterMax = parseInt(document.getElementById('prey-litter-max').value)
    preyInvestmentMin = parseFloat(document.getElementById('prey-investment-min').value)
    preyInvestmentMax = parseFloat(document.getElementById('prey-investment-max').value)
    preySpeedEfficiency = parseFloat(document.getElementById('prey-speed-efficiency').value)
    preySenseEfficiency = parseFloat(document.getElementById('prey-sense-efficiency').value)

    predatorStartNumber = parseInt(document.getElementById('predator-start-number').value)
    predatorMaxAge = parseInt(document.getElementById('predator-max-age').value)
    predatorEnergyMin = parseFloat(document.getElementById('predator-energy-min').value)
    predatorEnergyMax = parseFloat(document.getElementById('predator-energy-max').value)
    predatorSpeedMin = parseFloat(document.getElementById('predator-speed-min').value)
    predatorSpeedMax = parseFloat(document.getElementById('predator-speed-max').value)
    predatorAwarenessMin = parseFloat(document.getElementById('predator-awareness-min').value)
    predatorAwarenessMax = parseFloat(document.getElementById('predator-awareness-max').value)
    predatorGreedMin = parseFloat(document.getElementById('predator-greed-min').value)
    predatorGreedMax = parseFloat(document.getElementById('predator-greed-max').value)
    predatorLibidoMin = parseFloat(document.getElementById('predator-libido-min').value)
    predatorLibidoMax = parseFloat(document.getElementById('predator-libido-max').value)
    predatorGestation = parseInt(document.getElementById('predator-gestation-length').value)*1000
    predatorLitterMin = parseInt(document.getElementById('predator-litter-min').value)
    predatorLitterMax = parseInt(document.getElementById('predator-litter-max').value)
    predatorInvestmentMin = parseFloat(document.getElementById('predator-investment-min').value)
    predatorInvestmentMax = parseFloat(document.getElementById('predator-investment-max').value)
    predatorSpeedEfficiency = parseFloat(document.getElementById('predator-speed-efficiency').value)
    predatorSenseEfficiency = parseFloat(document.getElementById('predator-sense-efficiency').value)
    resultsRead = false
    yearCount = 0
    grassList = []
    for (i=0; i<preyStartNumber; i++) {
        let prey = new Prey()
        
        preyList.push(prey)
    }
    for (i=0; i<predatorStartNumber; i++) {
        let pred = new Predator()
        predList.push(pred)
    }
    for (i=0; i<grassStartNumber; i++) {
        let grass = new Grass()
        grassList.push(grass)
    }
    
    //Maintenance function to check data yearly
    maintenance = setInterval( function() {
        // console.log(preyList)
        // console.log(predList)
        yearCount += 1

    },12000)
    
    setInterval(function() {
        // let grass = new Grass()
        // grassList.push(grass)
        grassList.forEach((grass,i) => {
            grass.seed(grassList)
            // if (grass.x > width || grass.x < 0 || grass.y > length )
        })
    },grassSpawnRate)
    
}

function main_loop() {
    if (running === true) {
        ctx.clearRect(0,0,width,height)

        grassList.forEach(function(grass){
            ctx.drawImage(grass.img,grass.x,grass.y)
        })
        
        preyList.forEach(function(prey,i){
            
            if (prey.age >= prey.maxAge) {
                preyList.splice(i,1)
            }

            if (prey.energy < prey.greed) {
                prey.eat(grassList)
            }
            
            predList.forEach((pred, i) => {
                let danger = prey.checkProximity(pred)
                if (danger < prey.awareness) {
                    prey.moveAway(pred)
                }
            })
            

            prey.mate(preyList)
            
            prey.move()

            //Kills prey who have no energy--they starve
            if (prey.energy <= 0) {
                if (prey.pregnant === true) {
                    clearTimeout(this.pregnancy)
                }
                preyList.splice(i,1)
            }
            
            ctx.drawImage(prey.img,prey.x,prey.y)
        })

        predList.forEach(function(pred,i) {

            if (pred.age >= pred.maxAge) {
                predList.splice(i,1)
            }

            if (pred.energy < pred.greed) {
                pred.eat(preyList)
            }

            pred.mate(predList)

            pred.move()

            if (pred.energy <= 0) {
                if (pred.pregnant === true) {
                    clearTimeout(this.pregnancy)
                }
                predList.splice(i,1)
            }
            ctx.drawImage(pred.img,pred.x,pred.y)
        })

        if (preyList.length == 0 && predList.length == 0 && resultsRead === false) {
            ctx.clearRect(0,0,width,height)
            gameDescription= document.getElementById('game-description')
            gameDescription.style.visibility = 'visible'
            alert(`uh oh... all the varmints are dead. On the upside, your ecosystem lasted ${yearCount} years before total ecological collapse!`)
            resultsRead = true
            running = false
            gameDescription= document.getElementById('game-description')
            gameDescription.style.visibility = 'visible'
        }   

        window.requestAnimationFrame(main_loop)
    }
}


//grass, rabbit, fox, and question mark images are free assets obtained with permission from flaticon.com