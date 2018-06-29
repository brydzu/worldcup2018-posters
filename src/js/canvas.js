import { calculateWidth, getUrlParams, getMatchCode, returnRGBA } from './utils'
import FileSaver from 'file-saver'
import allMatches from './data/matches.json'
import { filterData } from './data/index'
import Stripes from './shapes/Stripes'
import PercentBar from './shapes/PercentBar'
import Noise from './shapes/Noise'
import SmoothCurve from './shapes/SmoothCurve'
import ConicalGradient from './shapes/ConicalGradient'
import Triangle from './shapes/Triangle'
import OverlayShape from './shapes/OverlayShape'
import Cross from './shapes/Cross'
import Text from './shapes/Text'

import FontFaceObserver from 'fontfaceobserver'

// DOM Style
const canvas = document.querySelector('canvas')
const next = document.getElementById('next')
const prev = document.getElementById('prev')

const c = canvas.getContext('2d')
const size = 2
const outMargin = 90
const innerMargin = 45 * size

canvas.width = calculateWidth(innerHeight * size - outMargin)
canvas.height = innerHeight * size - outMargin

/*addEventListener('resize', () => {
    canvas.width = calculateWidth(innerHeight - outMargin)
    canvas.height = innerHeight - outMargin

    init()
})*/

// Implementation
let gridWidth = (canvas.width - innerMargin * 2) / 3
let gridHeight = (canvas.height - innerMargin * 2) / 5

let objects
function init() {
    objects = []

    const passAcurrancy = new Stripes({
        x: innerMargin,
        y: innerMargin + gridHeight,
        width: gridWidth,
        height: gridHeight,
        data: data.passAcurrancy,
        color: data.color,
        context: c
    })

    const ballPossession = new PercentBar({
        x: innerMargin,
        y: innerMargin + gridHeight * 2,
        width: gridWidth,
        height: gridHeight * 3,
        data: data.ballPossession,
        color: data.color,
        context: c
    })

    const gameIntensity = new Noise({
        x: innerMargin + gridWidth,
        y: innerMargin + gridHeight * 2,
        width: gridWidth * 2,
        height: gridHeight * 3,
        data: data.intensity, //TODO: DATA
        color: data.color,
        context: c,
        size: size
    })

    const attempts = new SmoothCurve({
        x: innerMargin + gridWidth,
        y: innerMargin + gridHeight * 2,
        width: gridWidth * 2,
        height: gridHeight * 3,
        data: data.attempts, //TODO: DATA
        color: data.color,
        context: c
    })

    const discipline = new Triangle({
        x: innerMargin + gridWidth,
        y: innerMargin + gridHeight,
        width: gridWidth * 2,
        height: gridHeight,
        data: data.discipline, //TODO: DATA
        color: data.color,
        context: c,
        size: size
    })

    const goals = new OverlayShape({
        x: innerMargin + gridWidth / 2,
        y: innerMargin + gridHeight * 2,
        radius: gridWidth / 3.8,
        width: gridWidth * 2,
        height: gridHeight,
        data: data.infos,
        color: data.color,
        context: c
    })

    const fouls = new Cross({
        x: innerMargin + gridWidth * 2 - innerMargin,
        y: innerMargin + gridHeight + gridHeight / 2,
        width: 150,
        data: data.fouls,
        size: gridWidth / 6,
        color: data.color,
        context: c
    })

    const infos = new Text({
        gridHeight: gridHeight,
        gridWidth: gridWidth,
        margin: innerMargin,
        data: data.infos,
        color: data.color,
        context: c
    })

    objects.push(passAcurrancy)
    objects.push(ballPossession)
    objects.push(gameIntensity)
    objects.push(attempts)
    objects.push(discipline)
    objects.push(goals)
    objects.push(fouls)
    objects.push(infos)
}

// Animation Loop
function animate() {
    //requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    c.fillStyle = returnRGBA(data.color.bg)
    c.fillRect(0, 0, canvas.width, canvas.height)

    // x, y, width, height radius
    let [r, g, b] = data.color.bg
    new ConicalGradient()
        .addColorStop(0, [r, g, b, 0.3])
        .addColorStop(0.35, [r, g, b, 0.3])
        .addColorStop(1, [0, 0, 0, 0.2])
        .fill(
            c,
            innerMargin + gridWidth,
            innerMargin + gridHeight * 2,
            gridWidth * 2,
            data.distanceCovered * 2 * size, //TODO:DATA
            gridWidth * 2,
            0,
            Math.PI * 2,
            false
        )

    objects.forEach(object => {
        object.update()
    })
}

//------------------
// Start
// ------------------
let match = getUrlParams(window.location.href).match
if (!match) {
    match = getMatchCode(window.location.pathname)
}

let data = filterData(allMatches[match])

//Next
let nIndex = parseInt(match) + 1
if (nIndex < allMatches.length - 1) {
    let nextGame = `${allMatches[nIndex].home_team_country}-vs-${
        allMatches[nIndex].away_team_country
    }`.toLowerCase()
    next.setAttribute(
        'href',
        `${next.getAttribute('href')}/match/${nIndex}/${nextGame}`
    )
}

//Prev
nIndex = parseInt(match) - 1
if (nIndex > 0) {
    let preGame = `${allMatches[nIndex].home_team_country}-vs-${
        allMatches[nIndex].away_team_country
    }`.toLowerCase()
    prev.setAttribute(
        'href',
        `${prev.getAttribute('href')}/match/${nIndex}/${preGame}`
    )
}

const fontA = new FontFaceObserver('Timmons NY')
const fontB = new FontFaceObserver('Dharma Gothic E')
Promise.all([fontA.load(), fontB.load()]).then(function() {
    init()
    animate()
})

//------------------
// Generate
// ------------------
/*
let count = 0
let jsonTemplate = []

function generateDraw() {
    if (allMatches[count].status != 'completed') {
        console.log(jsonTemplate)
        return
    }
    data = filterData(allMatches[count])
    init()
    animate()

    setTimeout(() => {
        canvas.toBlob(function(blob) {
            let fileName = `${allMatches[count].home_team.code}-${
                allMatches[count].away_team.code
            }.png`
            FileSaver.saveAs(blob, fileName)

            let matchStage = allMatches[count].stage_name
            let url = `/match/${count}/${
                allMatches[count].home_team_country
            }-vs-${allMatches[count].away_team_country}`

            if (jsonTemplate[matchStage] === undefined) {
                jsonTemplate[matchStage] = []
            }
            jsonTemplate[matchStage].push({
                file: fileName,
                url: url
            })

            count = count + 1
            generateDraw()
        })
    }, 2000)
}

generateDraw()
//let interval = setInterval(generateDraw, 10000)
*/