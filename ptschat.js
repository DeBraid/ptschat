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

      var message = templ.find('#messageText').value;
      var messageTitle = templ.find('#messageTitle').value;

      Messages.insert({
        messageTitle: messageTitle, 
        message: message,
        score: 1,
        email: getCurrEmail(),
        votes: [Meteor.userId()] ,
        createdAt: new Date().valueOf()
      });
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








