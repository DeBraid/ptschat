// explicit global
Messages = new Meteor.Collection('Messages');

var getCurrEmail = function () {
  return Meteor.user() &&
    Meteor.user().emails &&
    Meteor.user().emails[0].address;
};

if (Meteor.isClient) {
  
  Template.messages.allMessages = function () {
    // passing no args to find, it will return all
    return Messages.find({}, {
      sort: {score: -1}
    });
  },

  Template.messages.showArrow = function () {
    return Meteor.userId() && 
      ! _.contains(this.votes, Meteor.userId());
  },


  Template.messages.userId = function () {
    return Meteor.userId();
  },

  Template.messages.events({
    // map from css selector to behaviour
    "click .vote": function (evt, templ) {
      Messages.update(this._id, {

        $inc: {score: 1}, 
        $addToSet: {votes: Meteor.userId()}

      })
    },

    "click #messageSubmit": function (evt, templ) {
        evt.preventDefault();

      var message = templ.find('#messageText').value,
          messageTitle = templ.find('#messageTitle').value,
          warning = templ.find('#valid') || templ.find('#invalid');


      if (message.length && messageTitle.length) { 
        
        Messages.insert({
          messageTitle: messageTitle, 
          message: message,
          score: 1,
          email: getCurrEmail(),
          votes: [Meteor.userId()],
          createdAt: new Date().valueOf()
        });

        warning.setAttribute("id", "valid");

        message = ''; 
        messageTitle = '';

      } else {

        warning.setAttribute("id", "invalid");
        
      }

    }
  })
}

if (Meteor.isServer) {
  
  Messages.allow({
  
    insert: function (userId, doc) {

      if ( !_.isEqual(doc.votes, [userId]) ) {
        return false;
      }
      if (!doc.email || !doc.message) {
        return false;
      }
      if (doc.score !== 1) {
        return false
      }
      return true
    },

    update: function (userId, doc, fieldNames, modifier) { 
      return _.isEqual(modifier, {
        $inc: {score: 1},
        $addToSet: {votes: Meteor.userId()}
      });
    }
  })
}








