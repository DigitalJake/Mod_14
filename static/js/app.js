/*
JSON has 3 items
 names
     Array of strings with "id" of every person
 metadata
     all the individuals (each has a unique "id")
     "id": int
     "ethnicity": string
     "gender": string
     "age": int
     "location": str
     "bbtype": str
     "wfreq": float
 samples
     data for each individual - All 3 are arrays have the same length
     "otu_ids": Array of OTU id ints
     "sample_values": Array of OTU values (count of OTU???)
     "otu_labels": Array of OTU string labels
*/

const url = "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";
// values will be set after JSON is loaded
let sampleNames;
let samplesMetadata;
let samplesSamples;

function init() {
    d3.json(url).then(function(data) {
        sampleNames = data.names;
        samplesMetadata = data.metadata;
        samplesSamples = data.samples;

        // set values into dropDown
        let dropDown = d3.select("#selDataset");
        for (i =0; i < sampleNames.length; i++) {
            dropDown.append("option")
                    .text(sampleNames[i])
                    .attr("value", sampleNames[i])
        }

        // initialSetup(949);  // three values, use for testing
        initialSetup(940);  // many values (first in `names`)
    });
}

function initialSetup(individual) {
    // values are already sorted by `sample_values` in original json
    // use == instead of === because value my be number or string type
    let individualData = samplesSamples.filter(sample => (sample.id == individual.toString()))[0];
    let individualMetadata = samplesMetadata.filter(meta => (meta.id == individual))[0];

    // Individual Metadata
    setMetadata(individual);

    // Create Charts
    let singleSampleIds = individualData.otu_ids;
    let singleSampleValues = individualData.sample_values;
    let singleSampleLabels = individualData.otu_labels;

    let config = {displayModeBar: false,};  // hide the Plotly toolbar

    // Bar Chart
    let barTrace = [{
        x: singleSampleValues.slice(0, 10).reverse(),
        y: singleSampleIds.slice(0, 10).map(ids => `OTU ${ids}`).reverse(),
        text: singleSampleLabels.slice(0, 10).reverse(),
        name: "Taxa",
        type: "bar",
        orientation: "h",
    }];
    let barLayout = {
        title: "Top 10 Samples",
        margin: {t: 30, b: 40},
        xaxis: {title: "Sample Values",
                fixedrange: true},
        yaxis: {title: "Samples",
                fixedrange: true},
    };
    Plotly.newPlot("bar", barTrace, barLayout, config)

    // Bubble Chart
    let bubbleTrace = [{
        x: singleSampleIds,
        y: singleSampleValues,
        text: singleSampleLabels,
        mode: 'markers',
        marker: {
            size: singleSampleValues,
            color: singleSampleIds,
            colorscale: "Bluered",
        },
    }];
    let bubbleLayout = {
        title: "Values per OTU ID",
        margin: {t: 30, b: 40, l: 50, r: 10, pad: 6},
        xaxis: {title: "OTU ID"},
        yaxis: {title: "Sample Values"},
    };
    Plotly.newPlot("bubble", bubbleTrace, bubbleLayout, config);

    // Gauge Chart
    let gaugeTrace = [{
        value: individualMetadata.wfreq,
        type: "indicator",
        mode: "gauge+number",
        gauge: {
            axis: {dtick: 1,
                   range: [null, 10],
                   tickcolor: "black",
                   ticks: "inside",},
            bar: {color: "#ee8844",
                  thickness: 0.5}, // replace  or add needle?
            bgcolor: "white",
            borderwidth: 1,
            bordercolor: "black",
            steps: [
                {range: [0, 1], color: "#ffffa8"},
                {range: [1, 2], color: "#f1fa95"},
                {range: [2, 3], color: "#e2f583"},
                {range: [3, 4], color: "#d1f172"},
                {range: [4, 5], color: "#beec61"},
                {range: [5, 6], color: "#a9e851"},
                {range: [6, 7], color: "#92e441"},
                {range: [7, 8], color: "#76e031"},
                {range: [8, 9], color: "#52db20"},
                {range: [9, 10], color: "#00d70a"},
                ],
        },
    }];
    let gaugeLayout = {
        title: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week",
    };
    Plotly.plot("gauge", gaugeTrace, gaugeLayout, config);
};

function setMetadata(individual) {
    let individualMetadata = samplesMetadata.filter(meta => (meta.id == individual))[0];
    let metadataDiv = d3.select("#sample-metadata");

    // update the metadata by removing and re-adding <p> elements
    metadataDiv.selectAll("p").remove();  // remove existing <p> elements to prepare for new ones
    metadataDiv.selectAll("p")
               .data(Object.entries(individualMetadata))  // bind Array of [key, value] pairs
               .enter()
               .append("p")
               .text(d => `${d[0]}: ${d[1]}`);
};

function updateCharts(individual) {
    // Filter original json data for new individual id
    let individualData = samplesSamples.filter(sample => (sample.id == individual.toString()))[0];
    let individualMetadata = samplesMetadata.filter(meta => (meta.id == individual))[0];

    // update charts with restyle()
    let singleSampleIds = individualData.otu_ids;
    let singleSampleValues = individualData.sample_values;
    let singleSampleLabels = individualData.otu_labels;

    let barUpdate = {
        x: [singleSampleValues.slice(0, 10).reverse()],
        y: [singleSampleIds.slice(0, 10).map(ids => `OTU ${ids}`).reverse()],
        text: [singleSampleLabels.slice(0, 10).reverse()],
    };
    console.log(barUpdate);
    Plotly.restyle("bar", barUpdate);

    let bubbleUpdate = {
        x: [singleSampleIds],
        y: [singleSampleValues],
        text: [singleSampleLabels],
       'marker.size': [singleSampleValues],
       'marker.color': [singleSampleIds],
    };
    Plotly.restyle("bubble", bubbleUpdate);

    let gaugeUpdate = {
        value: individualMetadata.wfreq,
    };
    Plotly.restyle("gauge", gaugeUpdate);
}

function optionChanged(value) {
    console.log("Value changed to:", value);
    setMetadata(value);
    updateCharts(value);
};

// load the charts for the first time
init();