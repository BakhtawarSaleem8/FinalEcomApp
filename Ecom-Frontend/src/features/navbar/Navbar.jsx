import { Fragment, useEffect } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  ShoppingCartIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectItems } from '../cart/cartSlice';
import { fetchLoggedInUserAsync, fetchLoggedInUserOrderAsync, selectUserInfo, selectUserInfoStatus } from '../user/userSlice';

// Split navigation into public and protected routes
const publicNavigation = [
  { name: 'Products', link: '/' }
];

const protectedNavigation = [
  { name: 'Admin Products', link: '/admin', admin: true },
  { name: 'Orders', link: '/admin/orders', admin: true },
];

const userNavigation = [
  { name: 'My Profile', link: '/profile' },
  { name: 'My Orders', link: '/my-orders' },
  { name: 'Sign out', link: '/logout' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function NavBar({ children }) {
  const items = useSelector(selectItems);
  const userInfo = useSelector(selectUserInfo);
  const userStatus = useSelector(selectUserInfoStatus); // Add this selector
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(fetchLoggedInUserAsync())
  }, [])
  

  console.log(userInfo , "userInfo")
  // Show loading state while user data is being fetched
  if (userStatus === 'loading') {
    return    <div className="flex justify-center items-center h-full mb-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div> // Or a proper loading spinner
  }
  console.log(userInfo , "userrr")
  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Link to="/">
                      <img
                        className="h-8 w-8"
                        src="/logo.webp"
                        alt="Your Company"
                      />
                    </Link>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {/* Always show public navigation */}
                      {publicNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.link}
                          className={classNames(
                            'text-gray-300 hover:bg-gray-700 hover:text-white',
                            'rounded-md px-3 py-2 text-sm font-medium'
                          )}
                        >
                          {item.name}
                        </Link>
                      ))}
                      
                      {/* Show protected navigation only if user is logged in and has the right role */}
                      {userInfo && protectedNavigation.map((item) =>
                        item[userInfo?.role] ? (
                          <Link
                            key={item.name}
                            to={item.link}
                            className={classNames(
                              'text-gray-300 hover:bg-gray-700 hover:text-white',
                              'rounded-md px-3 py-2 text-sm font-medium'
                            )}
                          >
                            {item.name}
                          </Link>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    <Link to="/cart">
                      <button
                        type="button"
                        className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      >
                        <ShoppingCartIcon
                          className="h-6 w-6"
                          aria-hidden="true"
                        />
                      </button>
                    </Link>
                    {items.length > 0 && (
                      <span className="inline-flex items-center rounded-md mb-7 -ml-3 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                        {items.length}
                      </span>
                    )}

                    {/* Profile dropdown - only shown when logged in */}
                    {userInfo ? (
                      <Menu as="div" className="relative ml-3">
                        <div>
                          <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                            <span className="sr-only">Open user menu</span>
                               {
                        userInfo?.imageUrl ? 
                          <img
                        className="h-10 w-10 rounded-full"
                        src={userInfo?.imageUrl}
                        alt=""
                      />:
                      <div className="h-10 w-10 rounded-full text-blue-950 bg-white  flex justify-center items-center border-2 border-white ">{userInfo?.name?.charAt(0) || ''}</div>
                      }
                    
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <Link
                                    to={item.link}
                                    className={classNames(
                                      active ? 'bg-gray-100' : '',
                                      'block px-4 py-2 text-sm text-gray-700'
                                    )}
                                  >
                                    {item.name}
                                  </Link>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    ) : (
                      <Link
                        to="/login"
                        className="ml-3 rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        Sign In
                      </Link>
                    )}
                  </div>
                </div>
                <div className="-mr-2 flex md:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                {/* Mobile public navigation */}
                {publicNavigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.link}
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
                
                {/* Mobile protected navigation */}
                {userInfo && protectedNavigation.map((item) =>
                  item[userInfo?.role] ? (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}

                      to={item.link}
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ) : null
                )}
              </div>
              {userInfo ? (
                <div className="border-t border-gray-700 pb-3 pt-4">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      {
                        userInfo?.imageUrl ? 
                          <img
                        className="h-10 w-10 rounded-full"
                        src={userInfo?.imageUrl}
                        alt=""
                      />:
                      <div className="h-10 w-10 rounded-full">{userInfo?.name?.[0]}</div>
                      }
                    
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">
                        {userInfo?.name}
                      </div>
                      <div className="text-sm font-medium leading-none text-gray-400">
                        {userInfo?.email}
                      </div>
                    </div>
                    <Link to="/cart">
                      <button
                        type="button"
                        className="ml-auto flex-shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      >
                        <ShoppingCartIcon
                          className="h-6 w-6"
                          aria-hidden="true"
                        />
                      </button>
                    </Link>
                    {items.length > 0 && (
                      <span className="inline-flex items-center rounded-md bg-red-50 mb-7 -ml-3 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                        {items.length}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as={Link}
                        to={item.link}
                        className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-700 pb-3 pt-4">
                  <div className="px-2">
                    <Disclosure.Button
                      as={Link}
                      to="/login"
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      Sign In
                    </Disclosure.Button>
                  </div>
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            E-Commerce
          </h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default NavBar;