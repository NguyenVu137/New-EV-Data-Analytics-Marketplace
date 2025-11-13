import React, { Component } from 'react';
import { connect } from 'react-redux';
import HomeHeader from './HomeHeader';
import Specialty from './Section/Specialty';
import CarBrands from './Section/CarBrands';
import FeaturedData from './Section/FeaturedData';
import About from './Section/About';
import HomeFooter from './HomeFooter';
import './HomePage.scss';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            filter: null
        };
        this.featuredDataRef = React.createRef();
    }

    handleFilterChange = (filterType, filterValue) => {
        this.setState({ filter: { [filterType]: filterValue } });
        // Call FeaturedData to apply filter
        if (this.featuredDataRef.current) {
            this.featuredDataRef.current.handleFilterChange(filterType, filterValue);
        }
    }

    // handleAfterChange = (event, slick, currentSlide) => {

    // }

    render() {
        let settings = {
            dots: false,
            infinite: false,
            speed: 500,
            slidesToShow: 4,
            slidesToScroll: 1,
            //afterChange: this.handleAfterChange
        }
        return (
            <div>
                <HomeHeader onFilterChange={this.handleFilterChange} />
                <FeaturedData ref={this.featuredDataRef} settings={settings} />
                <Specialty settings={settings} />
                <CarBrands settings={settings} />
                <About />
                <HomeFooter />
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

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
