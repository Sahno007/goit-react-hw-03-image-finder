import React, { Component } from 'react';
import SearchBar from './SearchBar/SearchBar';
import ImageGallery from './ImageGallery/ImageGallery';
import Modal from './Modal/Modal';
import fetchPixabay from 'Services/pixabay';
import Button from './Button/Button';
import Loader from './Loader/Loader';

export class App extends Component {
  state = {
    searchText: '',
    currentPage: 1,
    totalHits: 0,
    items: [],
    error: '',
    isLoading: false,
    isShowModal: false,
    selectedIMG: '',
  };

  componentDidUpdate = async (prevProps, prevState) => {
    if (
      prevState.searchText !== this.state.searchText ||
      prevState.currentPage !== this.state.currentPage
    ) {
      this.setState({ isLoading: true, error: '' });

      try {
        const response = await fetchPixabay(this.state.searchText, this.state.currentPage);

        if (!response.ok) {
          throw new Error('Sorry, something went wrong');
        }

        const data = await response.json();

        if (data.totalHits === 0) {
          throw new Error('Sorry, nothing found');
        }

        const newItems =
          prevState.searchText !== this.state.searchText ? [] : this.state.items;

        this.setState({
          items: [...newItems, ...data.hits],
          totalHits: data.totalHits,
          isLoading: false,
        });
      } catch (error) {
        this.setState({
          error: error.message,
          isLoading: false,
        });
      }
    }
  };

  handlerCloseModal = () => {
    this.setState({ isShowModal: false });
  };

  handlerImageClick = ({
    target: {
      dataset: { original },
    },
  }) => {
    this.setState({ isShowModal: true, selectedIMG: original });
  };

  handlerLoadMore = () => {
    this.setState({ currentPage: this.state.currentPage + 1, error: '' });
  };

  handlerSubmit = (value) => {
    this.setState({
      searchText: value,
      currentPage: 1,
      items: [],
      error: '',
    });
  };

  render() {
    return (
      <>
        <SearchBar onSubmit={this.handlerSubmit} />
        {this.state.isShowModal && (
          <Modal
            handlerCloseModal={this.handlerCloseModal}
            selectedIMG={this.state.selectedIMG}
          />
        )}
        {this.state.items.length > 0 && (
          <ImageGallery
            items={this.state.items}
            handlerImageClick={this.handlerImageClick}
          />
        )}
        {this.state.isLoading && <Loader />}
        {this.state.items.length < this.state.totalHits &&
          !this.state.error &&
          !this.state.isLoading && (
            <Button handlerLoadMore={this.handlerLoadMore} />
          )}
        {this.state.error && <p className="error">{this.state.error}</p>}
      </>
    );
  }
}
