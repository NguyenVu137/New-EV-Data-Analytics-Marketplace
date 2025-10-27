import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider from "react-slick";


class About extends Component {

    render() {
        return (
            <div className="section-share section-about">
                <div className="section-about-header">
                    About EV Data Analytics Marketplace
                </div>
                <div className="section-about-content">
                    <div className="content-left">
                        <iframe width="100%" height="500vh"
                            src="https://www.youtube.com/embed/Rph2f23rZjI"
                            title="USA  - Electric Vehicle Population Data Analysis - Power BI"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen>
                        </iframe>
                    </div>
                    <div className="content-right">
                        <p>
                            Get the full course: https://www.udemy.com/course/power-bi...

                            Here's a Power BI Tutorial Overview based on the dashboard titled "USA - Electric Vehicle Population Data". This tutorial will help learners understand the techniques and components used to build such a dashboard, focusing on skills, visuals, and interactivity rather than the actual data values.

                            Get the Dataset: https://colorstech.net/power-bi/power...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn
    };
};

const mapDispatchToProps = dispatch => {
    return {
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(About);
