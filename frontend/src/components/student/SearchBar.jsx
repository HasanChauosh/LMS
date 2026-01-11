import React from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const SearchBar = (data) => {
    const navigate = useNavigate();
    const [input, setInput] = React.useState('');

    const onSearchHandler = (e) => {
        e.preventDefault()
        navigate('/course-list/'+input)
    }
    return (
        <form className="flex items-center bg-white rounded-full border border-gray-100 
                     shadow-lg overflow-hidden w-full max-w-3xl mx-auto mt-4" onSubmit={onSearchHandler}>

            {/* Search Icon - Increased size and adjusted padding */}
            <div className="pl-6">
                <img
                    src={assets.search_icon}
                    alt="search"
                    className="w-6 h-6 opacity-50"
                />
            </div>

            {/* Input Field - Larger text and padding */}
            <input
                onChange={(e) => setInput(e.target.value)}
                value={input}
                type="text"
                placeholder="Search for courses"
                className="flex-1 px-5 py-5 text-xl text-gray-700 placeholder-gray-400
                       focus:outline-none bg-transparent"
            />

            {/* Search Button - Larger, bolder, and nicer colors */}
            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 transition duration-300
                       text-white px-10 py-5 text-xl font-semibold rounded-r-full"
            >
                Search
            </button>
        </form>
    )
}

export default SearchBar